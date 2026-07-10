import { jsPDF } from "jspdf";
import fs from "fs";

const doc = new jsPDF();

// Title
doc.setFont("helvetica", "bold");
doc.setFontSize(18);
doc.text("The Kingdom Alliances — Dummy Test Users", 14, 20);

doc.setFontSize(10);
doc.setFont("helvetica", "normal");
doc.text("Common Password for all accounts: Password123!", 14, 28);
doc.text("All accounts are located in Saudi Arabia, ages 18-35.", 14, 34);

let y = 45;

// Table Header for Grooms
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("Grooms (Male Profiles)", 14, y);
y += 6;

doc.setFontSize(9);
doc.text("Name", 14, y);
doc.text("Email", 50, y);
doc.text("City", 120, y);
doc.text("Denomination", 155, y);
y += 4;

doc.line(14, y - 2, 195, y - 2);

const grooms = [
  { name: "Gabriel Smith", email: "groom.gabriel.smith@example.com", city: "Riyadh", denom: "Catholic" },
  { name: "Nathaniel Johnson", email: "groom.nathaniel.johnson@example.com", city: "Jeddah", denom: "Catholic" },
  { name: "Samuel Williams", email: "groom.samuel.williams@example.com", city: "Dammam", denom: "Protestant" },
  { name: "Caleb Brown", email: "groom.caleb.brown@example.com", city: "Khobar", denom: "Protestant" },
  { name: "Isaac Jones", email: "groom.isaac.jones@example.com", city: "Mecca", denom: "Orthodox" },
  { name: "Joshua Miller", email: "groom.joshua.miller@example.com", city: "Medina", denom: "Baptist" },
  { name: "Elijah Davis", email: "groom.elijah.davis@example.com", city: "Jubail", denom: "Pentecostal" },
  { name: "Daniel Garcia", email: "groom.daniel.garcia@example.com", city: "Hofuf", denom: "Anglican / Episcopalian" },
  { name: "Luke Rodriguez", email: "groom.luke.rodriguez@example.com", city: "Tabuk", denom: "Methodist" },
  { name: "Matthew Wilson", email: "groom.matthew.wilson@example.com", city: "Taif", denom: "Lutheran" }
];

doc.setFont("helvetica", "normal");
grooms.forEach(g => {
  doc.text(g.name, 14, y);
  doc.text(g.email, 50, y);
  doc.text(g.city, 120, y);
  doc.text(g.denom, 155, y);
  y += 6;
});

y += 10;

// Table Header for Brides
doc.setFont("helvetica", "bold");
doc.setFontSize(12);
doc.text("Brides (Female Profiles)", 14, y);
y += 6;

doc.setFontSize(9);
doc.text("Name", 14, y);
doc.text("Email", 50, y);
doc.text("City", 120, y);
doc.text("Denomination", 155, y);
y += 4;

doc.line(14, y - 2, 195, y - 2);

const brides = [
  { name: "Seraphina Miller", email: "bride.seraphina.miller@example.com", city: "Khobar", denom: "Catholic" },
  { name: "Evangeline Davis", email: "bride.evangeline.davis@example.com", city: "Medina", denom: "Catholic" },
  { name: "Grace Garcia", email: "bride.grace.garcia@example.com", city: "Jubail", denom: "Protestant" },
  { name: "Hope Rodriguez", email: "bride.hope.rodriguez@example.com", city: "Hofuf", denom: "Protestant" },
  { name: "Faith Wilson", email: "bride.faith.wilson@example.com", city: "Tabuk", denom: "Orthodox" },
  { name: "Charity Smith", email: "bride.charity.smith@example.com", city: "Taif", denom: "Baptist" },
  { name: "Mercy Johnson", email: "bride.mercy.johnson@example.com", city: "Riyadh", denom: "Pentecostal" },
  { name: "Patience Williams", email: "bride.patience.williams@example.com", city: "Jeddah", denom: "Anglican / Episcopalian" },
  { name: "Verity Brown", email: "bride.verity.brown@example.com", city: "Dammam", denom: "Methodist" },
  { name: "Felicity Jones", email: "bride.felicity.jones@example.com", city: "Khobar", denom: "Lutheran" }
];

doc.setFont("helvetica", "normal");
brides.forEach(b => {
  doc.text(b.name, 14, y);
  doc.text(b.email, 50, y);
  doc.text(b.city, 120, y);
  doc.text(b.denom, 155, y);
  y += 6;
});

const pdfOutput = doc.output("arraybuffer");
fs.writeFileSync("./Dummy_Users_Credentials.pdf", Buffer.from(pdfOutput));
console.log("PDF generated successfully at: ./Dummy_Users_Credentials.pdf");
