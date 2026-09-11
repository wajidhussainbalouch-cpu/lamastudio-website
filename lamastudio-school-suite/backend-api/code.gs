/**
 * lamastudio.pk - Multi-Tenant Cloud ERP Backend API Bridge
 * Target Master Sheet columns: 
 * [Timestamp, School Name, School Code / ID, Admin Email, Admin Password, School Sector, District, Package Tier]
 */

const SHEET_NAME = "SchoolsMaster"; // Dedicated tab for registered institutions

function doPost(e) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    
    // Auto-create the Master Schools sheet if it doesn't exist yet
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
      sheet.appendRow([
        "Timestamp", "School Name", "School Code / ID", "Admin Email", 
        "Admin Password", "School Sector", "District", "Package Tier", 
        "Principal Name", "Phone", "Status"
      ]);
    }
    
    const data = JSON.parse(e.postData.contents);
    
    const timestamp = new Date().toISOString();
    const rowData = [
      timestamp,
      data.schoolName || "",
      data.schoolCodeId || "",
      data.adminEmail || "",
      data.adminPassword || "",
      data.schoolSector || "Private",
      data.schoolDistrict || "",
      data.packageTier || "",
      data.principalName || "",
      data.principalPhone || "",
      "Active"
    ];
    
    sheet.appendRow(rowData);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "School registered successfully" }))
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
    
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const rows = sheet.getDataRange().getValues();
    if (rows.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ status: "success", data: [] }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    const headers = rows[0];
    const schoolList = [];
    
    // Map rows into clean JSON objects for your Super Admin panel
    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      schoolList.push({
        "Timestamp": row[0],
        "School Name": row[1],
        "School Code / ID": row[2],
        "Admin Email": row[3],
        "Admin Password": row[4],
        "School Sector": row[5],
        "District": row[6],
        "Package Tier": row[7],
        "Principal Name": row[8],
        "Phone": row[9],
        "Status": row[10]
      });
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", data: schoolList }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
