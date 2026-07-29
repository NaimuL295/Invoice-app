import { getInvoices } from "../actions/getInvoices";
import { formatPrismaInvoices } from "@/lib/formatInvoice";
import TransitionClient from "./TransitionClient";

export default async function TransitionPage() {
  const rawData = await getInvoices();
  const invoices = formatPrismaInvoices(rawData);
  return <TransitionClient initialInvoices={invoices} />;
}
