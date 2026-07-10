"use client"; // 🟩 Essential for Next.js Client Component compilation

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Invoice, Item } from "@/types/next-auth";
import { toWords } from 'to-words';

interface LayoutProps {
  title?: string;
  data: Invoice;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
  },
  headerSection: {
    backgroundColor: "#9ca3af", 
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    color: "black",
    marginBottom: 10,
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "right",
  },
  invoiceTitle: {
    textAlign: "center",
    fontSize: 16,
    color: "#7c3aed",
    marginVertical: 10,
    textTransform: "capitalize",
  },
  infoBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#9ca3af",
    padding: 5,
    color: "white",
    fontWeight: "bold",
  },
  infoContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 5,
    marginBottom: 10,
  },
  table: {
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#9ca3af",
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#9ca3af",
    color: "white",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#9ca3af",
    minHeight: 25,
    alignItems: "center",
  },
  totalRow: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    fontWeight: "bold",
    minHeight: 25,
    alignItems: "center",
  },
  col1: { width: "5%", textAlign: "center", borderRightWidth: 1, borderRightColor: "#9ca3af", padding: 4 },
  col2: { width: "35%", borderRightWidth: 1, borderRightColor: "#9ca3af", padding: 4 },
  col3: { width: "15%", textAlign: "center", borderRightWidth: 1, borderRightColor: "#9ca3af", padding: 4 },
  col4: { width: "15%", textAlign: "center", borderRightWidth: 1, borderRightColor: "#9ca3af", padding: 4 },
  col5: { width: "15%", textAlign: "right", borderRightWidth: 1, borderRightColor: "#9ca3af", padding: 4 },
  col6: { width: "15%", textAlign: "right", padding: 4 },
  summaryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  summaryBox: {
    width: "48%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingVertical: 4,
  },
  amountWordsLabel: {
    backgroundColor: "#9ca3af",
    color: "white",
    padding: 4,
    fontWeight: "bold",
    marginBottom: 5,
  }
});

export default function LayoutTwo({ title, data }: LayoutProps) {
  const invoiceData = {
    user_name: data?.user_name || "Company Name",
    companyEmail: data?.email || "email@example.com",
    invoiceNo: data?.uid || data?.id || "0",
    billTo: data?.customer || "Customer Name",
    date: data?.date || "00-00-0000",
    items: data?.items || [],
    received: Number(data?.received) || 0,
    discount: Number(data?.discount) || 0,
    subtotal: Number(data?.subtotal || data?.total) || 0,
    user: data?.user || null, 
    total: Number(data?.total) || 0,
  };

  // Safe handler to prevent toWords errors on initial mount / empty state
  const getAmountInWords = () => {
    try {
      return toWords(invoiceData.total || 0);
    } catch {
      return "Zero";
    }
  };

  const discountAmount = (invoiceData.subtotal * invoiceData.discount) / 100;
  const balanceDue = invoiceData.total - invoiceData.received;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header Section */}
        <View style={styles.headerSection}>
          <View><Text style={{ color: 'white' }}>Logo</Text></View>
          <View>
            {/* 🟩 Patched crash vector using optional chaining & template fallback */}
            <Text style={styles.companyName}>
              {invoiceData.user?.email || invoiceData.user_name}
            </Text>
            <Text style={{ textAlign: 'right', fontSize: 8 }}>Email: {invoiceData.companyEmail}</Text>
          </View>
        </View>

        <Text style={styles.invoiceTitle}>{title || "Invoice"}</Text>

        {/* Info Blocks */}
        <View style={styles.infoBar}>
          <Text style={{ width: '50%' }}>Bill To</Text>
          <Text style={{ width: '50%', textAlign: 'right' }}>Invoice Details</Text>
        </View>
        
        <View style={styles.infoContent}>
          <Text style={{ fontWeight: 'bold' }}>{invoiceData.billTo}</Text>
          <View>
            <Text style={{ textAlign: 'right' }}>Invoice No.: {invoiceData.invoiceNo}</Text>
            <Text style={{ textAlign: 'right' }}>Date: {invoiceData.date}</Text>
          </View>
        </View>

        {/* Dynamic Table Layout */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Item Name</Text>
            <Text style={styles.col3}>Quantity</Text>
            <Text style={styles.col4}>Unit</Text>
            <Text style={styles.col5}>Price/ Unit</Text>
            <Text style={styles.col6}>Amount</Text>
          </View>

          {invoiceData.items.map((item: Item, index: number) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{item.item_name}</Text>
                <Text style={styles.col3}>{qty}</Text>
                <Text style={styles.col4}>{item.unit || "Pcs"}</Text>
                <Text style={styles.col5}>{price.toFixed(2)}</Text>
                <Text style={styles.col6}>{(price * qty).toFixed(2)}</Text>
              </View>
            );
          })}

          {/* Table Totals Row */}
          <View style={styles.totalRow}>
            <Text style={[styles.col1, { borderRightWidth: 0 }]}></Text>
            <Text style={[styles.col2, { fontWeight: 'bold' }]}>Total</Text>
            <Text style={[styles.col3, { fontWeight: 'bold' }]}></Text>
            <Text style={styles.col4}></Text>
            <Text style={styles.col5}></Text>
            <Text style={[styles.col6, { fontWeight: 'bold' }]}>{invoiceData.subtotal.toFixed(2)}</Text>
          </View>
        </View>

        {/* Summary Container */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.amountWordsLabel}>Invoice Amount In Words:</Text>
            <Text style={{ marginBottom: 15, textTransform: 'capitalize' }}>{getAmountInWords()}</Text>
            
            <Text style={styles.amountWordsLabel}>Terms and Conditions</Text>
            <Text style={{ fontSize: 8, color: '#555' }}>Thank you for doing business with us.</Text>
          </View>

          {/* Breakdown Ledger */}
          <View style={styles.summaryBox}>
            <View style={[styles.summaryRow, { backgroundColor: '#9ca3af', color: 'white', padding: 4 }]}>
              <Text style={{ fontWeight: 'bold' }}>Amounts Ledger</Text>
              <Text></Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Sub Total</Text>
              <Text>{invoiceData.subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Discount ({invoiceData.discount}%)</Text>
              <Text>{discountAmount.toFixed(2)}</Text>
            </View>
            <View style={[styles.summaryRow, { fontWeight: 'bold' }]}>
              <Text>Total</Text>
              <Text>{invoiceData.total.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text>Received</Text>
              <Text>{invoiceData.received.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ fontWeight: 'bold' }}>Balance</Text>
              <Text style={{ fontWeight: 'bold' }}>{balanceDue.toFixed(2)}</Text>
            </View>
          </View>
        </View>

        {/* Footer Area */}
        <View style={{ marginTop: 40, alignItems: 'flex-end' }}>
          <View style={{ borderTopWidth: 1, borderTopColor: '#000', width: 150, paddingTop: 5 }}>
            <Text style={{ textAlign: 'center', fontSize: 9 }}>Authorized Signatory</Text>
          </View>
        </View>

      </Page>
    </Document>
  );
}