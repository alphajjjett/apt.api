import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import fontTH from "./font/THSARABUN.TTF";

Font.register({ family: "sath", src: fontTH });

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#F3F4F6",
    padding: 20,
    fontFamily: "sath",
  },
  section: {
    margin: 10,
    padding: 20,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  },
  heading: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 10,
    marginTop: 10,
    color: "#000000",
  },
  text: {
    fontSize: 12,
    marginBottom: 6,
    color: "#333333",
  },
  boldText: {
    fontWeight: "bold",
    color: "#000000",
  },
  separator: {
    borderBottom: "1px solid #E0E0E0",
    margin: "10px 0",
  },
  table: {
    width: "100%",
    border: "1px solid #E0E0E0",
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: "row",
    borderBottom: "1px solid #E0E0E0",
  },
  tableCell: {
    padding: 8,
    borderRight: "1px solid #E0E0E0",
    fontSize: 12,
    textAlign: "center",
    width: "16.66%", // 6 cells per row (100%/6)
  },
  tableHeader: {
    fontWeight: "bold",
    backgroundColor: "#f5f5f5",
  },
  tableContent: {
    fontSize: 12,
    padding: 8,
    textAlign: "center",
  },
  logo: {
    width: 70, // ปรับขนาดกว้างของโลโก้
    height: 70, // ปรับขนาดสูงของโลโก้
    alignSelf: "left",
  },
  logoTextContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  textRight: {
    fontSize: 12,
    color: "#333333",
    right: 0,
    top: 0,
  },
  signatureContainer: {
    marginTop: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginRight: 40,
  },
  signatureText: {
    fontSize: 12,
    textAlign: "right",
    marginRight: 10, // ขยับ "ลงชื่อ" ไปทางซ้าย
    color: "#000",
  },
  signatureLine: {
    width: 120, // ทำให้เส้นสั้นลง
    borderBottomWidth: 1,
    borderBottomColor: "#000",
    marginBottom: 5,
  },
  signatureLabel: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 5,
    marginRight: 70, // ขยับมาทางซ้ายเล็กน้อย
    color: "#000",
  },
  datePlaceholder: {
    fontSize: 12,
    textAlign: "right",
    marginTop: 10,
    marginRight: 65, // ขยับให้ตรงกับตำแหน่งเส้น
    color: "#000",
  },
});

const getStatusText = (status) => {
  switch (status) {
    case "pending":
      return "รออนุมัติ";
    case "in-progress":
      return "อยู่ระหว่างภารกิจ";
    case "completed":
      return "อนุมัติ";
    case "cancel":
      return "ไม่อนุมัติ";
    case "waiting":
      return "รอเบิกเชื้อเพลิง";
    default:
      return "ไม่ทราบสถานะ";
  }
};

const Print = ({ vehicle, mission, user, fuelRecords }) => {
  // ดึงข้อมูลเชื้อเพลิงที่ตรงกับภารกิจนี้
  const fuelRecord = fuelRecords.find(
    (fuel) =>
      String(fuel.userId) === String(mission.assigned_user_id?._id) &&
      String(fuel.vehicleId) === String(mission.assigned_vehicle_id?._id)
  );

  return (
    <Document>
      <Page style={styles.page}>
        <View style={styles.section}>
          {/* เพิ่มโลโก้ที่นี่ */}
          <View style={styles.logoTextContainer}>
            <Image style={styles.logo} src="./logo/logo.png" alt="โลโก้" />
            <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
              <Text style={styles.textRight}>แผนกธุรการ</Text>
              <Text style={styles.textRight}>กองโรงงานสรรพาวุธ 5</Text>
              <Text style={styles.textRight}>กรมสรรพาวุธทหารอากาศ</Text>
            </View>
          </View>

          <Text style={styles.heading}>ข้อมูลการการจอง</Text>
          <View style={[styles.table, styles.tableHeader]}>
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "20%" }]}
              >
                ภารกิจ
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "20%" }]}
              >
                รายละเอียดภารกิจ
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "20%" }]}
              >
                รถที่จอง
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "20%" }]}
              >
                ประเภทเชื้อเพลิง
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "20%" }]}
              >
                เชื้อเพลิงที่ใช้
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {mission.mission_name}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {vehicle.description}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {vehicle.assigned_vehicle_id?.name} (
                {vehicle.assigned_vehicle_id?.license_plate})
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {vehicle.assigned_vehicle_id?.fuel_type}
              </Text>
              <Text style={[styles.tableCell, { width: "20%" }]}>
                {fuelRecord ? `${fuelRecord.fuelCapacity} ลิตร` : "N/A"}
              </Text>
            </View>
          </View>

          <View style={[styles.table, styles.tableHeader, { marginTop: 10 }]}>
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                วันที่จอง
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                วันที่คืน
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                สถานะ
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {new Date(mission.start_date).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {new Date(mission.end_date).toLocaleDateString()}
              </Text>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {getStatusText(mission.status)}
              </Text>
            </View>
          </View>

          <Text style={styles.heading}>ข้อมูลผู้จอง</Text>
          <View style={[styles.table, styles.tableHeader]}>
            <View style={styles.tableRow}>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                หมายเลขประจำตัวผู้จอง
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                ชื่อผู้จอง
              </Text>
              <Text
                style={[styles.tableCell, styles.boldText, { width: "50%" }]}
              >
                ตำแหน่ง
              </Text>
            </View>
          </View>

          <View style={styles.table}>
            <View style={styles.tableRow}>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {user.assigned_user_id?.selfid}
              </Text>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {user.assigned_user_id?.name}
              </Text>
              <Text style={[styles.tableCell, { width: "50%" }]}>
                {user.assigned_user_id?.description}
              </Text>
            </View>
          </View>

          <View style={styles.separator} />

          {/* ลายเซ็น */}
          <View style={styles.signatureContainer}>
            <Text style={styles.signatureText}>ลงชื่อ</Text>
            <View style={styles.signatureLine} />
          </View>
          <Text style={styles.signatureLabel}>ผอ.กรว.5 สพ.ทอ.</Text>
          <Text style={styles.datePlaceholder}>____/_____/_____</Text>
        </View>
      </Page>
    </Document>
  );
};

export default Print;
