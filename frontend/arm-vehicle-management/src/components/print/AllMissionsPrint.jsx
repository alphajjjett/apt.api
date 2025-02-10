// AllMissionsPrint.js
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import fontTH from './font/THSARABUN.TTF';

// ลงทะเบียนฟอนต์ภาษาไทย
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
  },
  heading: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 10,
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
    marginBottom: 10,
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

// ฟังก์ชันช่วยหาเชื้อเพลิงที่ตรงกับภารกิจ
const getFuelForMission = (mission, fuelRecords) => {
  const fuelRecord = fuelRecords.find(
    (fuel) => 
      String(fuel.userId) === String(mission.assigned_user_id?._id) &&
      String(fuel.vehicleId) === String(mission.assigned_vehicle_id?._id)
  );
  return fuelRecord ? `${fuelRecord.fuelCapacity} ลิตร` : "N/A";
};

const getStatusText = (status) => {
  switch(status) {
    case 'pending': return 'รออนุมัติ';
    case 'in-progress': return 'อยู่ระหว่างภารกิจ';
    case 'completed': return 'อนุมัติ';
    case 'cancel': return 'ไม่อนุมัติ';
    case 'waiting': return 'รอเบิกเชื้อเพลิง';
    default: return 'ไม่ทราบสถานะ';
  }
};


const AllMissionsPrint = ({ missions, fuelRecords }) => {
  const recordsPerPage = 10;
  const totalPages = Math.ceil(missions.length / recordsPerPage);

  return (
    <Document>
      {Array.from({ length: totalPages }).map((_, pageIndex) => (
        <Page key={pageIndex} style={styles.page}>
          <View style={styles.section}>
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

            <Text style={styles.heading}>ข้อมูลการจองรถและการเบิกเชื้อเพลิง</Text>

            <View style={styles.table}>
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, styles.boldText, { width: '5%' }]}>No.</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '25%' }]}>ภารกิจ</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '15%' }]}>ชื่อผู้จอง</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '12%' }]}>วันที่จอง</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '12%' }]}>วันที่คืน</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '10%' }]}>รถ</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '10%' }]}>สถานะ</Text>
                <Text style={[styles.tableCell, styles.boldText, { width: '10%' }]}>เชื้อเพลิง (ลิตร)</Text>
              </View>

              {missions
                .slice(pageIndex * recordsPerPage, (pageIndex + 1) * recordsPerPage)
                .map((mission, index) => (
                  <View style={styles.tableRow} key={mission._id}>
                    <Text style={[styles.tableCell, { width: '5%' }]}>{pageIndex * recordsPerPage + index + 1}</Text>
                    <Text style={[styles.tableCell, { width: '25%' }]}>{mission.mission_name}</Text>
                    <Text style={[styles.tableCell, { width: '15%' }]}>{mission.assigned_user_id ? mission.assigned_user_id.name : 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '12%' }]}>{new Date(mission.start_date).toLocaleDateString()}</Text>
                    <Text style={[styles.tableCell, { width: '12%' }]}>{new Date(mission.end_date).toLocaleDateString()}</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>{mission.assigned_vehicle_id ? mission.assigned_vehicle_id.name : 'N/A'}</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>{getStatusText(mission.status)}</Text>
                    <Text style={[styles.tableCell, { width: '10%' }]}>{getFuelForMission(mission, fuelRecords)}</Text>
                  </View>
                ))}
            </View>
          </View>
        </Page>
      ))}
    </Document>
  );
};

export default AllMissionsPrint;
