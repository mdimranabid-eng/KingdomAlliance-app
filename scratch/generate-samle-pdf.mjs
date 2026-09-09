import jsPDF from 'jspdf';

export async function generateSamplePdf() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pw = 210, ph = 297, ml = 20;
  const NAVY = [4,14,42], GOLD = [212,175,55], DARK = [26,46,74], MUTED = [138,127,112];

  // Background
  doc.setFillColor(253,252,248);
  doc.rect(0,0,pw,ph,'F');

  // Decorative border
  doc.setDrawColor(GOLD[0],GOLD[1],GOLD[2]);
  doc.setLineWidth(0.5); doc.rect(10,10,pw-20,ph-20);
  doc.setLineWidth(0.2); doc.rect(12,12,pw-24,ph-24);

  // Header
  doc.setFillColor(NAVY[0],NAVY[1],NAVY[2]);
  doc.rect(0,0,pw,55,'F');
  doc.setDrawColor(GOLD[0],GOLD[1],GOLD[2]);
  doc.setLineWidth(0.8); doc.line(15,54,pw-15,54);

  doc.setFontSize(16);
  doc.setTextColor(GOLD[0],GOLD[1],GOLD[2]);
  doc.text('\u26ea', pw/2, 22, { align: 'center' });

  doc.setFontSize(22); doc.setFont('helvetica','bold');
  doc.setTextColor(GOLD[0],GOLD[1],GOLD[2]);
  doc.text('Kingdom Alliance', pw/2, 35, { align: 'center' });

  doc.setFontSize(7); doc.setFont('helvetica','normal');
  doc.setTextColor(200,176,122);
  doc.text('CHRISTIAN MATRIMONY ROOTED IN FAITH & VALUES', pw/2, 42, { align: 'center' });

  // Profile ID badge
  doc.setFillColor(GOLD[0],GOLD[1],GOLD[2]);
  doc.roundedRect(pw/2-40,46,80,7,3,3,'F');
  doc.setTextColor(NAVY[0],NAVY[1],NAVY[2]);
  doc.setFontSize(6); doc.setFont('helvetica','bold');
  doc.text('Profile ID: KA-7X9K2M', pw/2, 51.5, { align: 'center' });

  let y = 68;
  const col1 = ml, col2 = pw/2-5;

  // Helper
  function section(title, sy) {
    doc.setFontSize(12); doc.setTextColor(GOLD[0],GOLD[1],GOLD[2]); doc.setFont('helvetica','bold');
    doc.text(`\u2726 ${title}`, ml, sy);
    doc.setDrawColor(GOLD[0],GOLD[1],GOLD[2]); doc.setLineWidth(0.3);
    doc.line(ml, sy+1, pw-20, sy+1);
    return sy+8;
  }
  function fld(label, val, x, yPos) {
    doc.setFontSize(6.5); doc.setTextColor(MUTED[0],MUTED[1],MUTED[2]); doc.setFont('helvetica','bold');
    doc.text(label.toUpperCase(), x, yPos);
    doc.setFontSize(10); doc.setTextColor(DARK[0],DARK[1],DARK[2]); doc.setFont('helvetica','bold');
    doc.text(val, x, yPos+4.5);
    return yPos+13;
  }

  // Personal Details
  y = section('Personal Details', y);
  y = fld('Full Name', 'Johnathan Nathaniel Johnson', col1, y);
  y = fld('Date of Birth / Age', '15 March 1992 / 34 Years', col2, y-13);
  y = fld('Gender', 'Male', col1, y);
  y = fld('Height', "5'10\" (178 cm)", col2, y-13);
  y = fld('Marital Status', 'Never Married', col1, y);
  y = fld('Nationality', 'British', col2, y-13);
  y = fld('Location', 'London, United Kingdom', col1, y);
  y = fld('Mother Tongue', 'English', col2, y-13);
  y += 2;

  // Faith & Church
  y = section('Faith & Church', y);
  y = fld('Denomination', 'Catholic', col1, y);
  y = fld('Baptized', 'Yes (1994)', col2, y-13);
  y = fld('Church Name', "St. Mary's Cathedral", col1, y);
  y = fld('Church City', 'London', col2, y-13);
  y = fld('Pastor Name', 'Fr. Michael Williams', col1, y);
  y += 2;

  // Education & Career
  y = section('Education & Career', y);
  y = fld('Highest Education', "Master's Degree", col1, y);
  y = fld('Field of Study', 'Computer Science', col2, y-13);
  y = fld('Profession', 'Software Engineer', col1, y);
  y = fld('Employment Type', 'Full-time', col2, y-13);
  );
  y = fld('Annual Income', '$75,000 - $100,000', col1, y);
  y += 2;

  console.log('PDF generated:', outputPath);
  return doc;
}

generate().catch(err => console.error(err));