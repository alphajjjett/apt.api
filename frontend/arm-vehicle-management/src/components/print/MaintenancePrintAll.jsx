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
  boldText: {
    fontWeight: 'bold',
    color: '#000000',
  },
  separator: {
    borderBottom: '1px solid #E0E0E0',
    margin: '10px 0',
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
  tableHeader: {
    fontWeight: 'bold',
    backgroundColor: '#f5f5f5',
  },
  tableContent: {
    fontSize: 12,
    padding: 8,
    textAlign: 'center',
  },
  logo: {
    width: 70,  // ปรับขนาดกว้างของโลโก้
    height: 70,  // ปรับขนาดสูงของโลโก้
    alignSelf: 'left',
  },
  logoTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    // marginBottom: 20,
  },
  textRight: {
    fontSize: 12,
    color: '#333333',
    // position: 'absolute',
    right: 0,
    top: 0,
  },
});

const PrintMaintenance = ({ maintenance }) => (
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
        <Text style={styles.heading}>ข้อมูลการซ่อมบำรุงรถยนต์</Text>
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableCell, styles.boldText, { width: '20%' }]}>ยี่ห้อรถ</Text>
            <Text style={[styles.tableCell, styles.boldText, { width: '10%' }]}>รุ่น</Text>
            <Text style={[styles.tableCell, styles.boldText, { width: '15%' }]}>ทะเบียน</Text>
            <Text style={[styles.tableCell, styles.boldText, { width: '40%' }]}>รายละเอียดการซ่อมบำรุง</Text>
            {/* <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>สถานะของรถ</Text> */}
            <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>วันที่ / เวลา</Text>
          </View>
          {maintenance.map((record) => (
            <View style={styles.tableRow} key={record._id}>
              <Text style={[styles.tableCell, { width: '20%' }]}>{record.vehicleId.name}</Text>
              <Text style={[styles.tableCell, { width: '10%' }]}>{record.vehicleId.model}</Text>
              <Text style={[styles.tableCell, { width: '15%' }]}>{record.vehicleId.license_plate}</Text>
              <Text style={[styles.tableCell, { width: '40%' }]}>{record.description || 'N/A'}</Text>
              {/* <Text style={[styles.tableCell, { width: '25%' }]}>{record.vehicleId.status}</Text> */}
              <Text style={[styles.tableCell, { width: '25%' }]}>
                {record.updatedAt ? new Date(record.updatedAt).toLocaleString() : 'N/A'}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);

export default PrintMaintenance;
