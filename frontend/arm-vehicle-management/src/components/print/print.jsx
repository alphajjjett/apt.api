import React from 'react'
import { Document, Page, Text, View, StyleSheet,PDFDownloadLink } from '@react-pdf/renderer';


// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#E4E4E4',
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
});

const print = ({ vehicle, user }) => {

  
    return (
      <Document>
        <Page style={styles.page}>
          <View style={styles.section}>
            <Text>Vehicle Name: {vehicle.name}</Text>
            <Text>License Plate: {vehicle.license_plate}</Text>
            <Text>Fuel Capacity: {vehicle.fuel_capacity}</Text>
          </View>
          <View style={styles.section}>
            <Text>User Name: {user.name}</Text>
            <Text>User ID: {user.selfid}</Text>
          </View>
        </Page>
      </Document>
    );
  };
  
  

export default print
