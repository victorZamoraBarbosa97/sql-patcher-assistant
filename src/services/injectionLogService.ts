// src/services/injectionLogService.ts
import {
  collection,
  addDoc,
  serverTimestamp,
  getDocs,
  query,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase"; // Importamos la instancia de la BD

// Definimos la estructura de nuestros logs de inyección
export interface InjectionLog {
  id?: string; // Firestore lo genera automáticamente
  createdAt: Timestamp; // Usaremos el timestamp del servidor
  patchType: "repair" | "cloning" | "timeShift";
  target: {
    ip: string;
    alias: string;
    deviceId: string | null;
    interfaceId: string | null;
    statsId: string | null;
    interfaceName?: string;
  };
  source: {
    ip: string | null;
    alias: string | null;
    deviceId: string | null;
    interfaceId: string | null;
    statsId: string | null;
  } | null;
  dateRange: {
    start: string | null;
    end: string | null;
  };
  fillMode?: "prev" | "next";
  injectionQuery: string;
  rollbackQuery: string;
}

const injectionsCollection = collection(db, "injections_portafolio");

/**
 * Guarda un registro de la operación de inyección en Firestore.
 * @param injectionData - Los datos de la inyección a guardar.
 */
export const logInjection = async (
  injectionData: Omit<InjectionLog, "id" | "createdAt">,
) => {
  try {
    const docRef = await addDoc(injectionsCollection, {
      ...injectionData,
      createdAt: serverTimestamp(), // Usa la hora del servidor para consistencia
    });
    console.log("✅ Injection logged with ID: ", docRef.id);
    return docRef.id;
  } catch (e) {
    console.error("🔥 Error adding document to Firestore: ", e);
    throw e; // Relanzamos el error para que el UI pueda manejarlo
  }
};

/**
 * Obtiene los últimos registros de inyección.
 * @param limitCount - Número máximo de registros a obtener (default 50).
 */
export const getInjections = async (limitCount = 50) => {
  try {
    const q = query(
      injectionsCollection,
      orderBy("createdAt", "desc"),
      limit(limitCount),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as InjectionLog[];
  } catch (e) {
    console.error("Error fetching injections: ", e);
    return [];
  }
};
