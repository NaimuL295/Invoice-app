"use client"; // 🟩 Added for Next.js safety

import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";
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
    borderWidth: 1,
    borderColor: "#ccc",
    borderStyle: "solid",
    height: "100%",
  },
  headerTitle: {
    fontSize: 20,
    textAlign: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  companySection: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    alignItems: "center",
  },
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: "#f3f4f6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderStyle: "solid",
  },
  logoImage: {
    width: "100%",
    height: "100%",
    objectFit: "contain",
  },
  companyDetails: {
    flex: 1,
    backgroundColor: "#eef5ff",
    padding: 10,
    borderWidth: 1,
    borderColor: "#adc6ff",
    borderStyle: "dashed",
  },
  companyName: {
    fontSize: 14,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  infoBar: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
    backgroundColor: "#f9f9f9",
  },
  infoCol: {
    flex: 1,
    padding: 8,
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
  },
  label: {
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  col1: {
    width: "5%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
    textAlign: "center",
    padding: 4,
  },
  col2: { width: "40%", borderRightWidth: 1, borderRightColor: "#ccc", borderRightStyle: "solid", padding: 4 },
  col3: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
    textAlign: "center",
    padding: 4,
  },
  col4: {
    width: "10%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
    textAlign: "center",
    padding: 4,
  },
  col5: {
    width: "15%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
    textAlign: "right",
    padding: 4,
  },
  col6: { width: "15%", textAlign: "right", padding: 4 },
  summaryContainer: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    borderTopStyle: "solid",
  },
  summaryLeft: {
    width: "65%",
    borderRightWidth: 1,
    borderRightColor: "#ccc",
    borderRightStyle: "solid",
    padding: 10,
  },
  summaryRight: {
    width: "35%",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 4,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
    borderBottomStyle: "solid",
  },
  totalRow: {
    backgroundColor: "#f9f9f9",
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    borderBottomStyle: "solid",
  },
  boldText: {
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: "#ccc",
    borderTopStyle: "solid",
    padding: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "auto",
  },
});

export default function LayoutThree({ title, data }: LayoutProps) {
  const invoiceData = {
    userName: data?.user?.user_name || data?.user_name || "Company Name",
    userLogo: data?.user?.image || null,
    companyEmail: data?.companyEmail || data?.email || "email@example.com",
    invoiceNo: data?.uid || data?.id || "0",
    billTo: data?.customer || "Customer Name",
    customer_number: data?.customer_number || "",
    customer_address: data?.customer_address || "",
    date: data?.date
      ? new Date(data.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "00-00-0000",
    items: data?.items || [],
    received: Number(data?.received) || 0,
    discountAmount: Number(data?.discount) || 0, // Flat monetary discount
    subtotal: Number(data?.subtotal) || 0,
    total: Number(data?.total) || 0,
  };

  const calculatedDue = invoiceData.total - invoiceData.received;

  // Calculates effective discount percentage dynamically
  const calculatedDiscountPercent = invoiceData.subtotal > 0
    ? Math.round((invoiceData.discountAmount / invoiceData.subtotal) * 100)
    : 0;

  // Safe fallback wrapper for toWords conversion
  const renderAmountInWords = () => {
    try {
      return `${toWords(invoiceData.total || 0)} Taka Only`;
    } catch {
      return "Zero Taka";
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.container}>
          <Text style={styles.headerTitle}>{title || "Invoice"}</Text>

          {/* Company Info Header */}
          <View style={styles.companySection}>
            <View style={styles.logoBox}>
              {invoiceData.userLogo ? (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image src={invoiceData.userLogo} style={styles.logoImage} />
              ) : (
                <Text style={{ color: "#666", fontSize: 8 }}>LOGO</Text>
              )}
            </View>
            <View style={styles.companyDetails}>
              <Text style={styles.companyName}>
                {invoiceData.userName}
              </Text>
              <Text style={{ marginTop: 2 }}>Email: {invoiceData.companyEmail}</Text>
            </View>
          </View>

          {/* Customer & Invoice Info */}
          <View style={styles.infoBar}>
            <View style={styles.infoCol}>
              <Text style={styles.label}>Bill To:</Text>
              <Text style={styles.boldText}>{invoiceData.billTo}</Text>
              {invoiceData.customer_number ? (
                <Text style={{ marginTop: 2 }}>Phone: {invoiceData.customer_number}</Text>
              ) : null}
              {invoiceData.customer_address ? (
                <Text style={{ marginTop: 2 }}>Address: {invoiceData.customer_address}</Text>
              ) : null}
            </View>
            <View style={[styles.infoCol, { borderRightWidth: 0 }]}>
              <Text style={styles.label}>Invoice Details:</Text>
              <Text>No: #{invoiceData.invoiceNo}</Text>
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
            const rowAmount = itemQuantity * itemPrice;

            return (
              <View style={styles.tableRow} key={item.id || index}>
                <Text style={styles.col1}>{index + 1}</Text>
                <Text style={styles.col2}>{item.item_name}</Text>
                <Text style={styles.col3}>{itemQuantity}</Text>
                <Text style={styles.col4}>{item.unit || "Pcs"}</Text>
                <Text style={styles.col5}>{itemPrice.toFixed(2)}</Text>
                <Text style={styles.col6}>{rowAmount.toFixed(2)}</Text>
              </View>
            );
          })}

          {/* Summary Section */}
          <View style={styles.summaryContainer}>
            <View style={styles.summaryLeft}>
              <Text style={[styles.boldText, { marginBottom: 2 }]}>
                Invoice Amount In Words:
              </Text>
              <Text style={{ marginBottom: 12, color: "#555", textTransform: "capitalize" }}>
                {renderAmountInWords()}
              </Text>

              <Text style={styles.boldText}>Terms And Conditions:</Text>
              <Text style={{ marginTop: 5, color: "#666" }}>
                Thank you for doing business with us.
              </Text>
            </View>

            <View style={styles.summaryRight}>
              <View style={styles.summaryRow}>
                <Text>Sub Total:</Text>
                <Text>{invoiceData.subtotal.toFixed(2)}</Text>
              </View>
              {invoiceData.discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text>
                    Discount{calculatedDiscountPercent > 0 ? ` (${calculatedDiscountPercent}%)` : ""}:
                  </Text>
                  <Text>-{invoiceData.discountAmount.toFixed(2)}</Text>
                </View>
              )}
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text>Total:</Text>
                <Text>Tk. {invoiceData.total.toFixed(2)}</Text>
              </View>
              <View style={{ padding: 6 }}>
                <Text style={{ fontSize: 8, marginBottom: 2 }}>
                  Received: {invoiceData.received.toFixed(2)}
                </Text>
                <Text style={[{ fontSize: 8 }, calculatedDue > 0 ? styles.boldText : {}]}>
                  Balance Due: {calculatedDue.toFixed(2)}
                </Text>
              </View>
            </View>
          </View>

          {/* Footer Signatory */}
          <View style={styles.footer}>
            <View />
            <View style={{ alignItems: "center" }}>
              <Text>For {invoiceData.userName}:</Text>
              <View
                style={{
                  marginTop: 25,
                  borderTopWidth: 1,
                  borderTopColor: "#000",
                  borderTopStyle: "dashed",
                  width: 110,
                  paddingTop: 5,
                  alignItems: "center",
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