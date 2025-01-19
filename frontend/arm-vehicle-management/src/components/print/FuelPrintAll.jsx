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
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
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
    width: '16.66%',  // 6 cells per row (100%/6)
  },
  separator: {
    borderBottom: '1px solid #E0E0E0',
    margin: '10px 0',
  },
  logo: {
    width: 70,  // ปรับขนาดกว้างของโลโก้
    height: 70,  // ปรับขนาดสูงของโลโก้
    alignSelf: 'left',
  },
  logoTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textRight: {
    fontSize: 12,
    color: '#333333',
    right: 0,
    top: 0,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#000000',
  }
});

const FuelPrintAll = ({ vehicles, users, fuelRecords }) => {
  const totalFuel = fuelRecords.reduce((total, record) => total + record.fuelCapacity, 0);  // Calculate total fuel

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          {/* เพิ่มโลโก้ที่นี่ */}
          <View style={styles.logoTextContainer}>
            <Image style={styles.logo} 
              src="./logo/logo.png" 
              alt="โลโก้" 
            />
            <View style={{ flexDirection: 'column', alignItems: 'flex-end' }}>
              <Text style={styles.textRight}>แผนกธุรการ</Text>
              <Text style={styles.textRight}>กองโรงงานสรรพาวุธ 5</Text>
              <Text style={styles.textRight}>กรมสรรพาวุธทหารอากาศ</Text>
            </View>
          </View>
          <Text style={styles.heading}>ข้อมูลการเบิกเชื้อเพลิง</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>ยี่ห้อรถ</Text>
              <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>เลขทะเบียนรถ</Text>
              <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>หมายเลขประจำตัวผู้จอง</Text>
              <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>ชื่อผู้จอง</Text>
              <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>เชื้อเพลิงที่เบิก (ลิตร)</Text>
            </View>
            {fuelRecords.map((record) => {
              const vehicle = vehicles.find(v => v._id === record.vehicleId);
              const user = users.find(u => u._id === record.userId);
              return vehicle && user ? (
                <View style={styles.tableRow} key={record._id}>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{vehicle.name}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{vehicle.license_plate}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{user.selfid}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{user.name}</Text>
                  <Text style={[styles.tableCell, { width: '25%' }]}>{record.fuelCapacity} ลิตร</Text>
                </View>
              ) : null;
            })}
          </View>
          <View style={styles.separator}>
            <Text style={[styles.boldText, { textAlign: 'right', marginTop: 10 }]}> 
              ยอดการเบิกทั้งหมด: {totalFuel} ลิตร
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default FuelPrintAll;
