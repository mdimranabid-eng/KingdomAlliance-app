import jsPDF from 'jspdf';
import { storage } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Kingdom Alliance Premium Brand Colors
const COLORS = {
  NAVY: [4, 14, 42],       // #040e2a - Deep Corporate Navy
  GOLD: [212, 175, 55],    // #d4af37 - Champagne Gold
  CHARCOAL: [45, 45, 45],  // #2d2d2d - Soft Black
  LIGHT_NAVY: [240, 242, 248], // #f0f2f8 - Row backgrounds
  WHITE: [255, 255, 255]
};

/**
 * Converts any URL to Base64 to avoid cross-origin issues in PDF generation.
 */
const urlToBase64 = async (url: string): Promise<string | null> => {
  try {
    let targetUrl = url;
    if (url.startsWith('gs://')) {
      const storageRef = ref(storage, url);
      targetUrl = await getDownloadURL(storageRef);
    }
    
    const response = await fetch(targetUrl);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.error('Image conversion error:', e);
    return null;
  }
};

/**
 * Utility to generate a high-end, corporate-style Matrimonial Biodata PDF.
 */
export const generateBiodataPDF = async (user: any) => {
  // Convert photo to Base64 before starting
  const photoBase64 = user.photoUrl ? await urlToBase64(user.photoUrl) : null;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const sidebarWidth = pageWidth * 0.3;
  const mainWidth = pageWidth - sidebarWidth;
  const margin = 12;

  // --- Helper: Draw Sections ---
  let currentPage = 1;
  const checkNewPage = (y: number, buffer = 20) => {
    if (y > pageHeight - buffer) {
      doc.addPage();
      currentPage++;
      drawLayout();
      return 30; // Reset Y to top of new page (below header/padding)
    }
    return y;
  };

  const drawLayout = () => {
    // Sidebar Background (Gold)
    doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

    // Footer
    doc.setFillColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('KINGDOM ALLIANCE — CONFIDENTIAL MATRIMONIAL BIODATA', pageWidth / 2, pageHeight - 3, { align: 'center' });
  };

  const addMainHeader = () => {
    // Top Navy Banner
    doc.setFillColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Photo (Circle with border)
    if (photoBase64) {
      const photoX = 12;
      const photoY = 10;
      const photoSize = 25;
      doc.setDrawColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
      doc.setLineWidth(1);
      doc.circle(photoX + (photoSize / 2), photoY + (photoSize / 2), photoSize / 2, 'S');
      doc.addImage(photoBase64, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST');
    }

    // Name & Basic Info
    doc.setTextColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
    doc.setFont('times', 'bold'); // Placeholder for Playfair
    doc.setFontSize(24);
    doc.text(`${user.name} ${user.lastName || ''}`.toUpperCase(), 45, 22);

    doc.setTextColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`${user.denomination || 'Christian'} • ${user.cityLiving || 'N/A'}`, 45, 30);

    // Watermark Logo
    doc.setTextColor(255, 255, 255, 0.2);
    doc.setFontSize(30);
    doc.text('KA', pageWidth - 25, 25);
  };

  const addSidebarSection = (title: string, items: { label: string, value: any }[], y: number) => {
    doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), margin, y);
    
    doc.setDrawColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
    doc.setLineWidth(0.3);
    doc.line(margin, y + 1.5, sidebarWidth - margin, y + 1.5);
    
    let currentY = y + 7;
    items.forEach(item => {
      if (!item.value) return;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
      doc.text(item.label, margin, currentY);
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
      const valText = String(item.value);
      const splitText = doc.splitTextToSize(valText, sidebarWidth - (margin * 2));
      doc.text(splitText, margin, currentY + 3.5);
      currentY += (splitText.length * 4) + 4;
    });
    return currentY + 4;
  };

  const addMainSection = (title: string, content: string, y: number) => {
    if (!content) return y;
    const currentY = checkNewPage(y);
    
    doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text(title.toUpperCase(), sidebarWidth + margin, currentY);
    
    doc.setDrawColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.setLineWidth(0.6);
    doc.line(sidebarWidth + margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
    
    doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    // Justified Text Implementation
    const drawJustified = (text: string, x: number, startY: number, width: number) => {
      const lines = doc.splitTextToSize(text, width);
      let lineY = startY;
      lines.forEach((line: string, i: number) => {
        if (lineY > pageHeight - 15) {
          doc.addPage();
          currentPage++;
          drawLayout();
          
          // Re-apply standard text layout styles
          doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(10);
          
          lineY = 20; // Reset to top of the next page
        }

        if (i === lines.length - 1 || doc.getTextWidth(line) < width * 0.8) {
          doc.text(line, x, lineY);
        } else {
          const words = line.split(' ');
          const totalWordsWidth = words.reduce((acc, w) => acc + doc.getTextWidth(w), 0);
          const space = (width - totalWordsWidth) / (words.length - 1);
          let currentX = x;
          words.forEach((w, j) => {
            doc.text(w, currentX, lineY);
            currentX += doc.getTextWidth(w) + space;
          });
        }
        lineY += 5; // 1.5 line height (approx for 10pt)
      });
      return lineY;
    };

    return drawJustified(content, sidebarWidth + margin, currentY + 8, mainWidth - (margin * 2)) + 6;
  };

  const addPreferenceGrid = (prefs: any, y: number) => {
    if (!prefs) return y;
    let currentY = checkNewPage(y);

    doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(12);
    doc.text('PARTNER PREFERENCES', sidebarWidth + margin, currentY);
    doc.setDrawColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.setLineWidth(0.6);
    doc.line(sidebarWidth + margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
    currentY += 8;

    const items = [
      { label: 'Age Range', value: `${prefs.ageMin} - ${prefs.ageMax} Years` },
      { label: 'Height Range', value: `${prefs.heightMin} - ${prefs.heightMax} ft` },
      { label: 'Denomination', value: prefs.denominations?.join(', ') },
      { label: 'Education', value: prefs.educationLevel },
      { label: 'Profession', value: prefs.employmentStatus },
      { label: 'Location', value: `${prefs.city || ''}, ${prefs.country || ''}` },
      { label: 'Marital Status', value: prefs.maritalStatus?.join(', ') },
      { label: 'Relocation', value: prefs.relocationPreference }
    ].filter(i => i.value && !i.value.includes('undefined'));

    items.forEach((item, i) => {
      if (currentY > pageHeight - 15) {
        doc.addPage();
        currentPage++;
        drawLayout();
        currentY = 20; // reset to top of the next page
      }
      if (i % 2 === 0) {
        doc.setFillColor(COLORS.LIGHT_NAVY[0], COLORS.LIGHT_NAVY[1], COLORS.LIGHT_NAVY[2]);
        doc.rect(sidebarWidth + margin, currentY - 4, mainWidth - (margin * 2), 6, 'F');
      }
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
      doc.text(item.label, sidebarWidth + margin + 2, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
      doc.text(String(item.value), sidebarWidth + margin + 40, currentY);
      currentY += 6;
    });
    return currentY + 10;
  };

  // --- Initial Draw ---
  drawLayout();
  addMainHeader();

  // --- Sidebar Content ---
  let sideY = 55;
  sideY = addSidebarSection('Personal Details', [
    { label: 'Date of Birth', value: user.dob },
    { label: 'Age', value: `${user.age} Years` },
    { label: 'Gender', value: user.gender },
    { label: 'Height', value: user.height },
    { label: 'Weight', value: user.weight ? `${user.weight} kg` : null },
    { label: 'Complexion', value: user.complexion },
    { label: 'Mother Tongue', value: Array.isArray(user.motherTongue) ? user.motherTongue.join(', ') : user.motherTongue },
    { label: 'Nationality', value: user.citizenship },
    { label: 'Marital Status', value: user.maritalStatus },
    { label: 'Children', value: user.noOfChildren }
  ], sideY);

  sideY = addSidebarSection('Faith & Ministry', [
    { label: 'Denomination', value: user.denomination },
    { label: 'Church Name', value: user.churchName },
    { label: 'Baptized', value: user.baptized },
    { label: 'Baptism Year', value: user.baptismYear },
    { label: 'Ministry Role', value: user.profession },
    { label: 'Involvement', value: user.spiritualInvolvement?.join(', ') },
    { label: 'Spiritual Gifts', value: user.spiritualGifts }
  ], sideY);

  sideY = addSidebarSection('Contact Details', [
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.mobileNumber }
  ], sideY);

  // --- Main Content ---
  let mainY = 55;
  mainY = addMainSection('About Me', user.aboutMe, mainY);
  mainY = addMainSection('Faith Testimony', user.faithBackground, mainY);

  mainY = addMainSection('Education & Career', 
    `Highest Education: ${user.education || 'N/A'}\nField of Study: ${user.fieldOfStudy || 'N/A'}\nInstitution: ${user.college || 'N/A'}\n\nProfession: ${user.profession || 'N/A'}\nEmployment Type: ${user.employmentType || 'N/A'}\nAnnual Income: ${user.annualIncome || 'N/A'}`, 
    mainY);

  mainY = addMainSection('Family Background', 
    `Father's Name: ${user.fathersName || user.fatherName || 'N/A'}\nFather's Occupation: ${user.fathersOccupation || user.fatherOccupation || 'N/A'}\n\nMother's Name: ${user.mothersName || user.motherName || 'N/A'}\nMother's Occupation: ${user.mothersOccupation || user.motherOccupation || 'N/A'}\n\nNumber of Siblings: ${user.numberOfSiblings || user.noOfSiblings || 'N/A'}\nFamily Type: ${user.familyType || 'N/A'}\nFamily Faith Background: ${user.familyFaith || 'N/A'}`, 
    mainY);

  mainY = addMainSection('Lifestyle & Interests', 
    `Hobbies: ${user.hobbies?.join(', ') || 'N/A'}\nLanguages Known: ${user.languagesKnown?.join(', ') || 'N/A'}\n\nDietary Habits: ${user.dietaryHabits || 'N/A'}\nDrinking Habits: ${user.drinkingHabits || 'N/A'}\nSmoking Habits: ${user.smokingHabits || 'N/A'}`, 
    mainY);

  mainY = addPreferenceGrid(user.partnerPreferences, mainY);

  doc.save(`${user.name.replace(/\s+/g, '_')}_Biodata_Premium.pdf`);
};
