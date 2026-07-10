import jsPDF from 'jspdf';
import { storage } from './firebase';
import { ref, getDownloadURL } from 'firebase/storage';

// Clean, Elegant Grayscale Palette (Black, Gray, and White)
const COLORS = {
  NAVY: [0, 0, 0],         // Pure Black for primary text & banners
  GOLD: [240, 240, 240],   // Light Gray for sidebar background
  CHARCOAL: [45, 45, 45],  // Soft Charcoal Black for general body text
  LIGHT_NAVY: [245, 245, 245], // Very Light Gray for alternating rows
  WHITE: [255, 255, 255],  // White
  LINE_GRAY: [180, 180, 180] // Slate/Gray for borders and dividing lines
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
 * Utility to generate a high-end, simple and elegant Matrimonial Biodata PDF in Grayscale.
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
    // Sidebar Background (Light Gray)
    doc.setFillColor(COLORS.GOLD[0], COLORS.GOLD[1], COLORS.GOLD[2]);
    doc.rect(0, 0, sidebarWidth, pageHeight, 'F');

    // Footer (Pure Black border and small text)
    doc.setFillColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.rect(0, pageHeight - 8, pageWidth, 8, 'F');
    doc.setFontSize(7);
    doc.setTextColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
    doc.setFont('helvetica', 'normal');
    doc.text('KINGDOM ALLIANCE — CONFIDENTIAL MATRIMONIAL BIODATA', pageWidth / 2, pageHeight - 3, { align: 'center' });
  };

  const addMainHeader = () => {
    // Top Black Banner
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
      try {
        doc.addImage(photoBase64, 'JPEG', photoX, photoY, photoSize, photoSize, undefined, 'FAST');
      } catch (err) {
        console.error("Failed to add profile photo to PDF:", err);
      }
    }

    // Name & Basic Info
    doc.setTextColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
    doc.setFont('times', 'bold');
    doc.setFontSize(24);
    doc.text(`${user.name || ''} ${user.lastName || ''}`.toUpperCase().trim(), 45, 22);

    doc.setTextColor(COLORS.WHITE[0], COLORS.WHITE[1], COLORS.WHITE[2]);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`${user.denomination || 'Christian'} • ${user.cityLiving || 'N/A'}`, 45, 30);

    // Watermark Logo
    doc.setTextColor(255, 255, 255, 0.15);
    doc.setFontSize(30);
    doc.text('KA', pageWidth - 25, 25);
  };

  const addSidebarSection = (title: string, items: { label: string, value: any }[], y: number) => {
    doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(title.toUpperCase(), margin, y);
    
    doc.setDrawColor(COLORS.LINE_GRAY[0], COLORS.LINE_GRAY[1], COLORS.LINE_GRAY[2]);
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
      doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
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
    
    doc.setDrawColor(COLORS.LINE_GRAY[0], COLORS.LINE_GRAY[1], COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(sidebarWidth + margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
    
    doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    
    const drawJustified = (text: string, x: number, startY: number, width: number) => {
      const lines = doc.splitTextToSize(text, width);
      let lineY = startY;
      lines.forEach((line: string, i: number) => {
        if (lineY > pageHeight - 15) {
          doc.addPage();
          currentPage++;
          drawLayout();
          
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
        lineY += 5;
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
    doc.setDrawColor(COLORS.LINE_GRAY[0], COLORS.LINE_GRAY[1], COLORS.LINE_GRAY[2]);
    doc.setLineWidth(0.5);
    doc.line(sidebarWidth + margin, currentY + 1.5, pageWidth - margin, currentY + 1.5);
    currentY += 8;

    const items = [
      { label: 'Age Range', value: prefs.ageMin ? `${prefs.ageMin} - ${prefs.ageMax} Years` : null },
      { label: 'Height Range', value: prefs.heightMin ? `${prefs.heightMin} - ${prefs.heightMax} ft` : null },
      { label: 'Denomination', value: prefs.denominations?.join(', ') },
      { label: 'Mother Tongue', value: prefs.motherTongue?.join(', ') },
      { label: 'Education', value: prefs.educationLevel },
      { label: 'Employment', value: prefs.employmentStatus },
      { label: 'Location', value: prefs.city || prefs.country ? `${prefs.city || 'Any'}, ${prefs.country || 'Any'}` : null },
      { label: 'Marital Status', value: prefs.maritalStatus?.join(', ') },
      { label: 'Relocation', value: prefs.relocationPreference },
      { label: 'Diet/Drink/Smoke', value: `${prefs.dietaryHabits || 'Any'} / ${prefs.drinkingHabits || 'Any'} / ${prefs.smokingHabits || 'Any'}` }
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

    if (prefs.otherPreferences) {
      currentY = checkNewPage(currentY + 4);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(COLORS.NAVY[0], COLORS.NAVY[1], COLORS.NAVY[2]);
      doc.text('Desired Partner description:', sidebarWidth + margin, currentY);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(COLORS.CHARCOAL[0], COLORS.CHARCOAL[1], COLORS.CHARCOAL[2]);
      const splitDesc = doc.splitTextToSize(prefs.otherPreferences, mainWidth - (margin * 2));
      doc.text(splitDesc, sidebarWidth + margin, currentY + 5);
      currentY += (splitDesc.length * 4) + 8;
    }

    return currentY + 10;
  };

  // --- Initial Draw ---
  drawLayout();
  addMainHeader();

  // --- Sidebar Content (Strictly Onboarding Fields) ---
  let sideY = 55;
  sideY = addSidebarSection('Personal Details', [
    { label: 'Date of Birth', value: user.dob },
    { label: 'Age', value: user.age ? `${user.age} Years` : null },
    { label: 'Gender', value: user.gender },
    { label: 'Height', value: user.height },
    { label: 'Weight', value: user.weight ? `${user.weight} kg` : null },
    { label: 'Complexion', value: user.complexion },
    { label: 'Body Type', value: user.bodyType },
    { label: 'Physical Status', value: user.physicalStatus },
    { label: 'Physical Status Details', value: user.physicalStatusDesc },
    { label: 'Mother Tongue', value: Array.isArray(user.motherTongue) ? user.motherTongue.join(', ') : user.motherTongue },
    { label: 'Languages Known', value: user.languagesKnown?.join(', ') },
    { label: 'Nationality', value: user.citizenship },
    { label: 'Country Living', value: user.countryLiving },
    { label: 'City Living', value: user.cityLiving },
    { label: 'Marital Status', value: user.maritalStatus }
  ], sideY);

  sideY = addSidebarSection('Church & Faith', [
    { label: 'Denomination', value: user.denomination },
    { label: 'Baptized', value: user.baptized },
    { label: 'Baptism Year', value: user.baptismYear },
    { label: 'Church Name', value: user.churchName },
    { label: 'Church City', value: user.churchCity },
    { label: 'Church Area', value: user.churchArea },
    { label: 'Diocese', value: user.diocese },
    { label: 'Pastor Name', value: user.pastorName },
    { label: 'Pastor Number', value: user.pastorNumber }
  ], sideY);

  sideY = addSidebarSection('Contact Info', [
    { label: 'Email', value: user.email },
    { label: 'Phone', value: user.mobileNumber },
    { label: 'Address', value: user.address }
  ], sideY);

  // --- Main Content ---
  let mainY = 55;
  mainY = addMainSection('About Me', user.aboutMe, mainY);

  mainY = addMainSection('Education & Career', 
    `Highest Education: ${user.education || 'N/A'}\nField of Study: ${user.fieldOfStudy || 'N/A'}\nInstitution/College: ${user.college || 'N/A'}\n\nProfession: ${user.profession || 'N/A'}\nEmployment Type: ${user.employmentType || 'N/A'}\nAnnual Income: ${user.annualIncome || 'N/A'}`, 
    mainY);

  mainY = addMainSection('Family Background', 
    `Father's Name: ${user.fathersName || 'N/A'}\nFather's Occupation: ${user.fathersOccupation || 'N/A'}\n\nMother's Name: ${user.mothersName || 'N/A'}\nMother's Occupation: ${user.mothersOccupation || 'N/A'}\n\nNumber of Siblings: ${user.numberOfSiblings || 'N/A'}`, 
    mainY);

  mainY = addMainSection('Lifestyle & Habits', 
    `Dietary Habits: ${user.dietaryHabits || 'N/A'}\nDrinking Habits: ${user.drinkingHabits || 'N/A'}\nSmoking Habits: ${user.smokingHabits || 'N/A'}\nHobbies & Interests: ${user.hobbies?.join(', ') || 'N/A'}`, 
    mainY);

  mainY = addPreferenceGrid(user.partnerPreferences, mainY);

  let profileName = '';
  if (user.name) profileName += user.name;
  if (user.middleName) profileName += ' ' + user.middleName;
  if (user.lastName) profileName += ' ' + user.lastName;
  profileName = profileName.replace(/\s+/g, ' ').trim() || 'Profile';

  const sanitizedName = profileName.replace(/[/\\?%*:|"<>]/g, '').trim();
  doc.save(`${sanitizedName}.pdf`);
};
