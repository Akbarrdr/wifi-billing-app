import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc,
  query,
  where,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

import { firebaseConfig } from "./firebase-config.js";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* =========================
   CUSTOMER SECTION
========================= */

// Tambah pelanggan
export async function addCustomer(name, paket, harga, phone) {
  await addDoc(collection(db, "customers"), {
    name,
    paket,
    harga,
    phone,
    createdAt: new Date()
  });
}

// Ambil semua pelanggan
export async function getCustomers() {
  const snapshot = await getDocs(collection(db, "customers"));
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// Hapus pelanggan
export async function deleteCustomer(id) {
  await deleteDoc(doc(db, "customers", id));
}

/* =========================
   BILLING SECTION
========================= */

// Generate tagihan bulanan
export async function generateMonthlyBills() {
  const customers = await getCustomers();
  const bulan = new Date().toISOString().slice(0,7); // contoh: 2026-02

  for (let c of customers) {

    const q = query(
      collection(db, "bills"),
      where("customerId", "==", c.id),
      where("bulan", "==", bulan)
    );

    const existing = await getDocs(q);

    if (existing.empty) {
      await addDoc(collection(db, "bills"), {
        customerId: c.id,
        customerName: c.name,
        bulan: bulan,
        harga: c.harga,
        status: "Belum Bayar",
        createdAt: new Date()
      });
    }
  }
}

// Ambil semua tagihan
export async function getBills() {
  const snapshot = await getDocs(collection(db, "bills"));
  return snapshot.docs.map(d => ({
    id: d.id,
    ...d.data()
  }));
}

// Tandai lunas
export async function payBill(id) {
  await updateDoc(doc(db, "bills", id), {
    status: "Lunas"
  });
}

// Ambil ringkasan keuangan
export async function getFinanceSummary() {
  const snapshot = await getDocs(collection(db, "bills"));
  const bills = snapshot.docs.map(d => d.data());

  let totalIncome = 0;
  let totalDebt = 0;
  let monthlyIncome = {};

  bills.forEach(b => {
    if (b.status === "Lunas") {
      totalIncome += Number(b.harga);

      if (!monthlyIncome[b.bulan]) {
        monthlyIncome[b.bulan] = 0;
      }
      monthlyIncome[b.bulan] += Number(b.harga);
    }

    if (b.status === "Belum Bayar") {
      totalDebt += Number(b.harga);
    }
  });

  return {
    totalIncome,
    totalDebt,
    monthlyIncome
  };
}