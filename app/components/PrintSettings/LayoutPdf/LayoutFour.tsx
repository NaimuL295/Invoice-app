"use client";

import { Invoice, Item } from "@/types/next-auth";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";

import { toWords } from "to-words/en-US";

interface LayoutProps {
  title?: string;
  data: Invoice;
}

// 🟩 Moved out of the component to prevent re-creation on every render
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 10,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  section: {
    marginBottom: 8,
  },
  headerText: {
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 4,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    borderBottom: "1 solid #ddd",
    paddingBottom: 2,
  },
  totalSection: {
    marginTop: 10,
    borderTop: "1 solid #000",
    paddingTop: 6,
  },
  totalText: {
    marginBottom: 2,
  },
});

export default function LayoutFour({ title, data }: LayoutProps) {
  const invoiceData = {
    user_name: data?.user_name || "Company Name",
    companyEmail: data?.email || "email@example.com",
    invoiceNo: data?.uid || "0",
    billTo: data?.customer || "Customer Name",
    date: data?.date || "00-00-0000",
    items: data?.items || [],
    received: Number(data?.received) || 0,
    discount: Number(data?.discount) || 0,
    subtotal: Number(data?.subtotal || data?.total) || 0,
    total: Number(data?.total) || 0,
  };

  const due = invoiceData.total - invoiceData.received;

  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <Text style={styles.title}>{title || "Invoice"}</Text>

        <View style={styles.section}>
          <Text style={styles.headerText}>Invoice Details</Text>
          <Text>Invoice No: {invoiceData.invoiceNo}</Text>
          <Text>Customer: {invoiceData.billTo}</Text>
          <Text>Date: {invoiceData.date}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.headerText}>Items</Text>
          {invoiceData.items.map((item: Item, index: number) => (
            <View style={styles.itemRow} key={index}>
              <Text>{item.item_name}</Text>
              <Text>
                {item.quantity} × {item.price}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totalSection}>
          <Text style={styles.totalText}>Subtotal: {invoiceData.subtotal}</Text>
          <Text style={styles.totalText}>Discount: {invoiceData.discount}%</Text>
          <Text style={styles.totalText}>Total: {invoiceData.total}</Text>
          <Text style={styles.totalText}>Received: {invoiceData.received}</Text>
          <Text style={styles.totalText}>Due: {due}</Text>
          <Text style={styles.totalText}>
            In Words: {toWords(invoiceData.total || 0)}
          </Text>
        </View>
      </Page>
    </Document>
  );
}