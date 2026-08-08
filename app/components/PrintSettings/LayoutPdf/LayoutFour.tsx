"use client";

import { Invoice, Item } from "@/types/next-auth";
import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import { toWords } from "to-words";

interface LayoutProps {
  title?: string;
  data: Invoice;
}

// Standardized guidelines optimized for 80mm (3-inch) Thermal POS Printers
const styles = StyleSheet.create({
  page: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 8,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#000000",
    backgroundColor: "#ffffff",
  },
  headerWrapper: {
    alignItems: "center",
    marginBottom: 8,
  },
  companyName: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    textTransform: "uppercase",
    marginBottom: 2,
  },
  receiptTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  metaSection: {
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "dashed",
    paddingBottom: 4,
  },
  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
  },
  metaLabel: {
    color: "#444444",
  },
  metaValue: {
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  tableHeader: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    borderBottomStyle: "dashed",
    paddingBottom: 3,
    marginBottom: 3,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 2,
    alignItems: "flex-start",
  },
  colDescription: {
    flex: 2.2,
    paddingRight: 2,
    flexWrap: "wrap",
  },
  colQty: { 
    flex: 0.5, 
    textAlign: "center" 
  },
  colPrice: { 
    flex: 1, 
    textAlign: "right" 
  },
  colTotal: { 
    flex: 1.1, 
    textAlign: "right" 
  },
  summarySection: {
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    borderTopStyle: "dashed",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 1,
  },
  boldSummaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    marginTop: 2,
    borderTopWidth: 1,
    borderTopColor: "#000000",
    borderBottomWidth: 1,
    borderBottomColor: "#000000",
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
  wordsText: {
    marginTop: 6,
    fontSize: 7.5,
    textAlign: "center",
    textTransform: "capitalize",
    paddingHorizontal: 4,
  },
  footerMessage: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    fontWeight: "bold",
  },
});

export default function LayoutFour({ title, data }: LayoutProps) {
  // Normalize incoming data structures safely
  const invoiceData = {
    user_name: data?.user_name || "RETAIL SHOP",
    customer_number: data?.customer_number || "",
    customer_address: data?.customer_address || "",
    companyEmail: data?.companyEmail || data?.email || "",
    invoiceNo: data?.uid || "0000",
    billTo: data?.customer || "Walk-in Customer",
    date: data?.date
      ? new Date(data.date).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "2-digit",
        })
      : "00-00-0000",
    items: data?.items || [],
    received: Number(data?.received) || 0,
    discountAmount: Number(data?.discount) || 0, // Flat discount amount in Tk
    subtotal: Number(data?.subtotal) || 0,
    total: Number(data?.total) || 0,
  };

  const due = invoiceData.total - invoiceData.received;

  // Derive discount percentage accurately from the subtotal and discount amount
  const calculatedDiscountPercent = invoiceData.subtotal > 0
    ? Math.round((invoiceData.discountAmount / invoiceData.subtotal) * 100)
    : 0;

  // Safe toWords evaluation with explicit BDT fallback styling
  let wordsRepresentation = "";
  if (invoiceData.total > 0) {
    try {
      wordsRepresentation = `${toWords(invoiceData.total)} Taka Only`;
    } catch (e) {
      wordsRepresentation = "";
    }
  }

  return (
    <Document>
      <Page size={{ width: 226 }} style={styles.page}>
        {/* Top Header Block */}
        <View style={styles.headerWrapper}>
          <Text style={styles.companyName}>{invoiceData.user_name}</Text>
          {invoiceData.companyEmail ? (
            <Text style={{ fontSize: 7, marginBottom: 2 }}>
              {invoiceData.companyEmail}
            </Text>
          ) : null}
          <Text style={styles.receiptTitle}>{title || "Invoice Details"}</Text>
        </View>

        {/* Invoice Metadata */}
        <View style={styles.metaSection}>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Inv No:</Text>
            <Text style={styles.metaValue}>#{invoiceData.invoiceNo}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Date:</Text>
            <Text style={styles.metaValue}>{invoiceData.date}</Text>
          </View>
          <View style={styles.metaRow}>
            <Text style={styles.metaLabel}>Cust:</Text>
            <Text style={styles.metaValue}>{invoiceData.billTo}</Text>
          </View>
          {invoiceData.customer_number ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Phone:</Text>
              <Text style={styles.metaValue}>{invoiceData.customer_number}</Text>
            </View>
          ) : null}
          {invoiceData.customer_address ? (
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Address:</Text>
              <Text style={styles.metaValue}>{invoiceData.customer_address}</Text>
            </View>
          ) : null}
        </View>

        {/* Dynamic Item Grid */}
        <View>
          <View style={styles.tableHeader}>
            <Text style={styles.colDescription}>Item</Text>
            <Text style={styles.colQty}>Qty</Text>
            <Text style={styles.colPrice}>Price</Text>
            <Text style={styles.colTotal}>Total</Text>
          </View>

          {invoiceData.items.map((item: Item, index: number) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const itemTotal = qty * price;

            return (
              <View style={styles.tableRow} key={item.id || index}>
                <Text style={styles.colDescription}>{item.item_name}</Text>
                <Text style={styles.colQty}>{qty}</Text>
                <Text style={styles.colPrice}>{price.toFixed(1)}</Text>
                <Text style={styles.colTotal}>{itemTotal.toFixed(1)}</Text>
              </View>
            );
          })}
        </View>

        {/* Financial Overview Section */}
        <View style={styles.summarySection}>
          <View style={styles.summaryRow}>
            <Text>Subtotal:</Text>
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

          <View style={styles.boldSummaryRow}>
            <Text>NET TOTAL:</Text>
            <Text>Tk. {invoiceData.total.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text>Paid:</Text>
            <Text>{invoiceData.received.toFixed(2)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={{ fontFamily: due > 0 ? "Helvetica-Bold" : "Helvetica", fontWeight: due > 0 ? "bold" : "normal" }}>Due:</Text>
            <Text style={{ fontFamily: due > 0 ? "Helvetica-Bold" : "Helvetica", fontWeight: due > 0 ? "bold" : "normal" }}>
              {due.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Verbal Translation Render */}
        {wordsRepresentation ? (
          <Text style={styles.wordsText}>{wordsRepresentation}</Text>
        ) : null}

        {/* Footer */}
        <Text style={styles.footerMessage}>THANK YOU FOR YOUR VISIT</Text>
      </Page>
    </Document>
  );
}