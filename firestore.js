import { getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";

import { firebaseConfig } from "./firebase-config.js";
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Tambah data pelanggan
export async function addCustomer(name, paket, harga) {
  await addDoc(collection(db, "customers"), {
    name: name,
    paket: paket,
    harga: harga,
    createdAt: new Date()
  });
}

// Ambil semua data pelanggan
export async function getCustomers() {
  const querySnapshot = await getDocs(collection(db, "customers"));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

// Hapus pelanggan
export async function deleteCustomer(id) {
  await deleteDoc(doc(db, "customers", id));
}

// Edit pelanggan
export async function updateCustomer(id, data) {
  await updateDoc(doc(db, "customers", id), data);
}