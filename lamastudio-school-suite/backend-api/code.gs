/**
 * lamastudio.pk - Google Apps Script Backend API Bridge
 * Target Spreadsheet columns: 
 * [student_ID, student_name, dob, cnic_no, class, parentage, phone_no, adress, password]
 */

const SHEET_NAME = "Sheet1"; // Change this if your spreadsheet tab has a different name

function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const data = JSON.parse(e.postData.contents);
    
    // Generate next unique Student ID (e.g., reads last ID and increments)
    const lastRow = sheet.getLastRow();
    let nextIdNum = 1;
    
    if (lastRow > 1) {
      const lastIdStr = sheet.getRange(lastRow, 1).getValue(); // Assumes student_ID is in Column 1
      if (lastIdStr && lastIdStr.includes("STU-")) {
        const numPart = parseInt(lastIdStr.replace("STU-", ""), 10);
        if (!isNaN(numPart)) {
          nextIdNum = numPart + 1;
        }
      }
    }
    
    const student_ID = "STU-" + String(nextIdNum).padStart(3, '0');
    
    // Map incoming form data to your exact column structure order
    const rowData = [
      student_ID,
      data.student_name || "",
      data.dob || "",
      data.cnic_no || "",
      data.class || "",
      data.parentage || "",
      data.phone_no || "",
      data.adress || "",
      data.password || ""
    ];
    
    // Append the new row to your Google Sheet database
    sheet.appendRow(rowData);
    
    // Return success JSON response back to your website frontend
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", student_id: student_ID }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const studentIdQuery = e.parameter.id; // e.g. ?id=STU-001
    
    if (!studentIdQuery) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "No student ID provided" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = sheet.getDataRange().getValues();
    let studentRecord = null;
    
    // Search rows for matching student ID (skip header row 0)
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i][0]).toUpperCase() === String(studentIdQuery).toUpperCase()) {
        studentRecord = {
          student_id: rows[i][0],
          student_name: rows[i][1],
          dob: rows[i][2],
          cnic_no: rows[i][3],
          class: rows[i][4],
          parentage: rows[i][5],
          phone_no: rows[i][6],
          adress: rows[i][7],
          password: rows[i][8] // Note: In production, handle passwords with care or exclude from general GET
        };
        break;
      }
    }
    
    if (studentRecord) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", data: studentRecord }))
        .setMimeType(ContentService.MimeType.JSON);
    } else {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "error", message: "Student record not found" }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

