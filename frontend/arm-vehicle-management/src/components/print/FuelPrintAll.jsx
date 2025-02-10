// FuelPrintPage.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import fontTH from './font/THSARABUN.TTF';

Font.register({ family: 'sath', src: fontTH });

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#F3F4F6',
    padding: 20,
    fontFamily: 'sath',
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    // ตรวจสอบให้แน่ใจว่าไม่มีสไตล์ที่บังคับไม่ให้ wrap เช่น break: 'avoid'
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 10,
    color: '#000000',
  },
  text: {
    fontSize: 12,
    marginBottom: 6,
    color: '#333333',
  },
  table: {
    width: '100%',
    border: '1px solid #E0E0E0',
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #E0E0E0',
  },
  tableCell: {
    padding: 8,
    borderRight: '1px solid #E0E0E0',
    fontSize: 12,
    textAlign: 'center',
  },
  separator: {
    borderBottom: '1px solid #E0E0E0',
    margin: '10px 0',
  },
  logo: {
    width: 70,
    height: 70,
    alignSelf: 'flex-start',
  },
  logoTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textRight: {
    fontSize: 12,
    color: '#333333',
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000000',
  }
});

const FuelPrintAll = ({ vehicles, users, fuelRecords }) => {
  // คำนวณยอดรวมของเชื้อเพลิง
  const totalFuel = fuelRecords.reduce((total, record) => total + record.fuelCapacity, 0);

  // กำหนดจำนวนรายการต่อหน้าเป็น 10 รายการ
  const recordsPerPage = 10;
  const totalPages = Math.ceil(fuelRecords.length / recordsPerPage);

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} style={styles.page}>
          <View style={styles.section}>
            {/* เฉพาะหน้าแรกแสดงโลโก้และข้อมูลส่วนหัว */}
            {pageIndex === 0 && (
              <View style={styles.logoTextContainer}>
                <Image style={styles.logo} src="./logo/logo.png" alt="โลโก้" />
                <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
                  <Text style={styles.textRight}>แผนกธุรการ</Text>
                  <Text style={styles.textRight}>กองโรงงานสรรพาวุธ 5</Text>
                  <Text style={styles.textRight}>กรมสรรพาวุธทหารอากาศ</Text>
                </View>
              </View>
            )}
            <Text style={styles.heading}>ข้อมูลการเบิกเชื้อเพลิง</Text>
            <View style={styles.table}>
              {/* หัวตาราง */}
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>ยี่ห้อรถ</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>เลขทะเบียนรถ</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>หมายเลขประจำตัวผู้จอง</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>ชื่อผู้จอง</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>เชื้อเพลิงที่เบิก (ลิตร)</Text>
              </View>
              {/* แสดงรายการตามหน้าที่แบ่งไว้ */}
              {fuelRecords
                .slice(pageIndex * recordsPerPage, (pageIndex + 1) * recordsPerPage)
                .map(record => {
                  const vehicle = vehicles.find(v => v._id === record.vehicleId);
                  const user = users.find(u => u._id === record.userId);
                  return vehicle && user ? (
                    <View style={styles.tableRow} key={record._id}>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{vehicle.name}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{vehicle.license_plate}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{user.selfid}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{user.name}</Text>
                      <Text style={[styles.tableCell, { width: '20%' }]}>{record.fuelCapacity} ลิตร</Text>
                    </View>
                  ) : null;
                })}
            </View>
            {/* เฉพาะหน้าสุดท้ายแสดงยอดรวม */}
            {pageIndex === totalPages - 1 && (
              <View style={styles.separator}>
                <Text style={[styles.boldText, { textAlign: 'right', marginTop: 10 }]}>
                  ยอดการเบิกทั้งหมด: {totalFuel} ลิตร
                </Text>
              </View>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default FuelPrintAll;
