"use client"; // 🟩 Added for Next.js safety

import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { Invoice, Item } from "@/types/next-auth";
import { toWords } from "to-words";

interface LayoutProps {
  title?: string;
  data: Invoice;
}

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#333",
  },
  container: {
    border: "1pt solid #ccc",
    height: "100%",
  },
  headerTitle: {
    fontSize: 20,
    textAlign: "center",
    padding: 10,
    borderBottom: "1pt solid #ccc",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  companySection: {
    flexDirection: "row",
    padding: 15,
    borderBottom: "1pt solid #ccc",
  },
  logoBox: {
    width: 80,
    height: 80,
    backgroundColor: "#888",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  companyDetails: {
    flex: 1,
    backgroundColor: "#eef5ff",
    padding: 10,
    border: "1pt dashed #adc6ff",
  },
  infoBar: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
    backgroundColor: "#f9f9f9",
  },
  infoCol: {
    flex: 1,
    padding: 5,
    borderRight: "1pt solid #ccc",
  },
  label: { 
    fontWeight: "bold", 
    marginBottom: 2 
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #ccc",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontWeight: "bold",
  },
  col1: {
    width: "5%",
    borderRight: "1pt solid #ccc",
    textAlign: "center",
    padding: 4,
  },
  col2: { width: "40%", borderRight: "1pt solid #ccc", padding: 4 },
  col3: {
    width: "15%",
    borderRight: "1pt solid #ccc",
    textAlign: "center",
    padding: 4,
  },
  col4: {
    width: "10%",
    borderRight: "1pt solid #ccc",
    textAlign: "center",
    padding: 4,
  },
  col5: {
    width: "15%",
    borderRight: "1pt solid #ccc",
    textAlign: "right",
    padding: 4,
  },
  col6: { width: "15%", textAlign: "right", padding: 4 },
  summaryContainer: {
    flexDirection: "row",
    borderTop: "1pt solid #ccc",
  },
  summaryLeft: {
    width: "65%",
    borderRight: "1pt solid #ccc",
    padding: 10,
  },
  summaryRight: {
    width: "35%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    borderBottom: "0.5pt solid #eee",
  },
  totalRow: {
    backgroundColor: "#f9f9f9",
    fontWeight: "bold",
    borderBottom: "1pt solid #ccc",
  },
  footer: {
    borderTop: "1pt solid #ccc",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  amountWordsLabel: {
    color: "white",
    padding: 4,
    justifyContent: "center",
    fontWeight: "bold", // 🟩 Removed 'display: flex' to prevent style processing crash
  }
});

export default function LayoutThree({ title, data }: LayoutProps) {
  const invoiceData = {
    user_name: data?.user_name || "Company Name",
    companyEmail: data?.email || "email@example.com",
    invoiceNo: data?.uid || data?.id || "0",
    billTo: data?.customer || "Customer Name", // 🟩 Swapped from user_name to dynamic customer property
    date: data?.date || "00-00-0000",
    items: data?.items || [],
    received: Number(data?.received) || 0,
    discount: Number(data?.discount) || 0,
    due: Number(data?.due) || 0,
    subtotal: Number(data?.subtotal || data?.total) || 0,
    total: Number(data?.total) || 0,
  };

  // Safe fallback wrapper for toWords conversion
  const renderAmountInWords = () => {
    try {
      return toWords(invoiceData.total || 0);
    } catch {
      return "Zero";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>{title || "Invoice"}</Text>

          {/* Company Info */}
          <View style={styles.companySection}>
            <View style={styles.logoBox}>
              <Text style={{ color: "#fff" }}>LOGO</Text>
            </View>
            <View style={styles.companyDetails}>
              <Text style={{ fontSize: 16, fontWeight: "bold" }}>
                {invoiceData.user_name}
              </Text>
              <Text>Email: {invoiceData.companyEmail}</Text>
            </View>
          </View>

          {/* Customer Info */}
          <View style={styles.infoBar}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Bill To:</Text>
              <Text>{invoiceData.billTo}</Text>
            </View>
            <View style={[styles.infoCol, { borderRight: 0 }]}>
              <Text style={styles.label}>Invoice Details:</Text>
              <Text>No: {invoiceData.invoiceNo}</Text>
              <Text>Date: {invoiceData.date}</Text>
            </View>
          </View>

          {/* Table Header */}
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={styles.col1}>#</Text>
            <Text style={styles.col2}>Item Name</Text>
            <Text style={styles.col3}>Quantity</Text>
            <Text style={styles.col4}>Unit</Text>
            <Text style={styles.col5}>Price/Unit</Text>
            <Text style={styles.col6}>Amount</Text>
          </View>

          {/* Table Body */}
          {invoiceData.items.map((item: Item, index: number) => {
            const itemQuantity = Number(item.quantity) || 0;
            const itemPrice = Number(item.price) || 0;
            const rowAmount = itemQuantity * itemPrice; // 🟩 Dynamic row totals calculation

            return (
              <View style={styles.tableRow} key={index}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{item.item_name}</Text>
                <Text style={styles.col3}>{itemQuantity}</Text>
                <Text style={styles.col4}>{item.unit || "Box"}</Text>
                <Text style={styles.col5}>{itemPrice.toFixed(2)}</Text>
                <Text style={styles.col6}>{rowAmount.toFixed(2)}</Text>
              </View>
            );
          })}

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryLeft}>
              <Text style={{ fontWeight: "bold", marginBottom: 2 }}>
                Invoice Amount In Words:
              </Text>
              <Text style={{ marginBottom: 12, color: "#555" }}>
                {renderAmountInWords()}
              </Text>
              
              <Text style={{ fontWeight: "bold" }}>Terms And Conditions:</Text>
              <Text style={{ marginTop: 5, color: "#666" }}>
                Thank you for doing business with us.
              </Text>
            </View>
            
            <View style={styles.summaryRight}>
              <View style={styles.summaryRow}>
                <Text>Sub Total:</Text>
                <Text>{invoiceData.subtotal.toFixed(2)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text>Discount ({invoiceData.discount}%):</Text>
                <Text>{invoiceData.discount.toFixed(2)}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text>Total:</Text>
                <Text>{invoiceData.total.toFixed(2)}</Text>
              </View>
              <View style={{ padding: 6 }}>
                <Text style={{ fontSize: 8, marginBottom: 2 }}>
                  Received: {invoiceData.received.toFixed(2)}
                </Text>
                <Text style={{ fontSize: 8, fontWeight: "bold" }}>
                  Balance: {invoiceData.due.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Signatory */}
          <View style={styles.footer}>
            <View />
            <View style={{ alignItems: "center" }}>
              <Text>For {invoiceData.user_name}:</Text>
              <View
                style={{
                  marginTop: 25,
                  borderTop: "1pt dashed #000",
                  width: 110,
                  paddingTop: 5,
                  alignItems: "center"
                }}
              >
                <Text style={{ fontSize: 8 }}>Authorized Signatory</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}