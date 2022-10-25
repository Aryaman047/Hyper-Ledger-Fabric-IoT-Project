/**
 * New script file
 */
/**
 * Chaincode for the iot software chain.
 */


/** Transaction after the Data mining is finished.
* @param {org.xyz.iotmlchain.mined} m
* @transaction
*/

function miningFinished(m){
  let softwareAsset = m.software;
  if(softwareAsset.state == 'MINING'){
  	softwareAsset.state = 'MINED';
  }
  
  else if(softwareAsset.state == 'MINED')
  {
    throw new window.alert("This Software has already been Analyzed")
  }
  
  else
  {    
throw new window.alert("Error occured while submitting the transaction for software with "+softwareAsset.did+" id");
  }
  
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(softwareAsset)});
  
 }


/** Transaction for showing that the mined raw Data has been sent for the Training.
* @param {org.xyz.iotmlchain.sent_for_separation} sfs
* @transaction
*/

function sentForSeparation(sfs){
  
  let softwareAsset = sfs.software;

  if(softwareAsset.state == 'MINED')
  {
    softwareAsset.state = 'GETTING_SEPARATED';
    softwareAsset.owner = 'MLTRAINER';
  }
  
  else if(softwareAsset.state == 'MINING')
  {
    throw new window.alert("This can be sent for training only after data is mined")
  }
  
  else if(softwareAsset.state == 'GETTING_SEPARATED')
  {
    throw new window.alert("This is already getting trained");
  }
  
  else 
  {
    throw new window.alert("Check the id of the data before submitting this transaction")
  }
  
 
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(softwareAsset)});
  
 
}

/** Transaction after the training has been completed.
* @param{org.xyz.iotmlchain.separation_complete} sc
* @transaction
*/


function separationComplete(sc){
  let softwareAsset = sc.software;
  let softwareId = softwareAsset.did;

  if(softwareAsset.state == 'GETTING_SEPARATED')
  {
    
    let  numberOfBunches= prompt("Enter the number of bunches made using "+softwareId+" : ", "");
    forLoopAsyncForSeparator(numberOfBunches,softwareId);
  }
  
  else if(softwareAsset.state == 'MINING' || softwareAsset.state == 'MINED')
  {
    throw new window.alert("This data has not yet been sent for training");
  }
 
  else
  {
    	throw new window.alert("Check the id of the data before submitting this transaction");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software').then(function 							
    deleteSoftwareAssetAfterSeparation(asset){return asset.remove(softwareAsset)});
  
}  

// function for training Data.
async function createBunchOfTenAfterSeparation(i,softwareId){
  let factory = getFactory();
  let NS = 'org.xyz.iotmlchain';
  let temp = i.toString();
  let software = factory.newResource(NS, 'Software', softwareId+'-SBTEN-B'+temp);
  
  software.quantity = '10';
  software.owner = 'MLTRAINER';
  software.state = 'SEPARATED_INTO_BUNCH_OF_TEN';
  software.request = 'NA';
  software.request = 'NA';
  software.quantitystate = 'KNOWN';
  
  let softwareRegistry = await getAssetRegistry(NS + '.Software');
  await softwareRegistry.addAll([software]);


}

// This for loop is called in the form of async function
// because if we try to call the for loop directly inside the if condition of seperationComplete method
// it will skip one iteration.

async function forLoopAsyncForSeparator(numberOfBunches,softwareId){
   let i;
   for(i=1;i<=numberOfBunches;i++){
   await createBunchOfTenAfterSeparation(i,softwareId);
    }
}




/** Transaction when an exporter tries to request Model.
* @param{org.xyz.iotmlchain.request_by_exporter} rbe
* @transaction
*/

function requestByExporter(rbe){
  let softwareAsset = rbe.software;
  if(softwareAsset.state == 'SEPARATED_INTO_BUNCH_OF_TEN' && softwareAsset.request == 'NA'){
    softwareAsset.request = 'EXPORTER_REQUEST_PENDING';
  }
  
  else if(softwareAsset.state == 'SEPARATED_INTO_BUNCH_OF_TEN' && softwareAsset.request != 'NA'){
  	throw new window.alert("Request has already been placed check the requeststatus for more info");
  }
  
  else if(softwareAsset.state !='SEPARATED_INTO_BUNCH_OF_TEN'){
    throw new window.alert("Check the state of the software before submitting software");
  }
  
  else{
    throw new window.alert("Some error occured");
  }
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(softwareAsset)});

}

/** Transaction when a Seperator tries to approve the request.
* @param{org.xyz.iotmlchain.request_approval_exporter} rae
* @transaction
*/

function requestApprovalExporter(rae){
  let reqStatus = rae.software;
  if(reqStatus.request == 'EXPORTER_REQUEST_PENDING')
  {
    reqStatus.request = 'EXPORTER_REQUEST_APPROVED';
   
  }
  
  else if(reqStatus.request == 'NA'){
    throw new window.alert("Request has not yet been placed by the exporter");
  }
  
  else  {
    throw new window.alert("Request by the exporter was already approved for the software");
  }
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
  
}




/** Transaction when a Seperator tries to deliver the software to the Exporter.
* @param{org.xyz.iotmlchain.in_delivery_exporter} ine
* @transaction
*/

function inDelivery(ine){
  let reqStatus = ine.software;
  if(reqStatus.request == 'EXPORTER_REQUEST_APPROVED')
  {
    reqStatus.request = 'IN_DELIVERY_EXPORTER';
    reqStatus.state = 'EXPORT_PROCESS';
  }
  
  else if(reqStatus.status != 'EXPORTER_REQUEST_APPROVED')
  {
    throw new window.alert("Submit this transaction only if the request status is set to 'EXPORTER_REQUEST_APPROVED'");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}

/** Transaction when Exporter gives acknowledgement about software being delivered.
* @param{org.xyz.iotmlchain.received_by_exporter} rbe
* @transaction
*/

function receivedByExporter(rbe)
{
  let reqStatus = rbe.software;
  if(reqStatus.request == 'IN_DELIVERY_EXPORTER')
  {
    reqStatus.request = 'DELIVERED_EXPORTER';
    reqStatus.owner ='IOTEXPORTER';
  }
  
  else if(reqStatus.status != 'IN_DELIVERY_EXPORTER')
  {
    throw new window.alert("Submit this transaction only if the request status is set to 'IN_DELIVERY_EXPORTER'");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}

/** Transaction when a Retailer tries to request software from Exporter.
* @param{org.xyz.iotmlchain.request_by_retailer} rbr
* @transaction
*/


function requestByRetailer(rbr){
  let reqStatus = rbr.software;
  if(reqStatus.request == 'DELIVERED_EXPORTER')
  {
    reqStatus.request = 'RETAILER_REQUEST_PENDING';
  }
   else if(reqStatus.request != 'DELIVERED_EXPORTER'){
      throw new window.alert("Submit this transaction only if the requeststatus is set to 'DELIVERED_EXPORTER'");

  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}

/** Transaction when request is approved by Exporter.
* @param{org.xyz.iotmlchain.request_approval_retailer} rar
* @transaction
*/


function requestApprovalRetailer(rar){
  let reqStatus = rar.software;
  if(reqStatus.request == 'RETAILER_REQUEST_PENDING')
  {
    reqStatus.request = 'RETAILER_REQUEST_APPROVED';
  }
  
  else if(reqStatus.request != 'RETAILER_REQUEST_PENDING'){
     throw new window.alert("Submit this transaction only if the requeststatus is set to 'RETAILER_REQUEST_PENDING'");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}



/** Transaction when Exporter delivers the software to Retailer.
* @param{org.xyz.iotmlchain.in_delivery_retailer} idr
* @transaction
*/


function deliveryToRetailer(idr){
  let reqStatus = idr.software;
  if(reqStatus.request == 'RETAILER_REQUEST_APPROVED')
  {
    reqStatus.request = 'IN_DELIVERY_RETAILER';
  }
  
  else if(reqStatus.request != 'RETAILER_REQUEST_APPROVED'){
     throw new window.alert("Submit this transaction only if the requeststatus is set to 'RETAILER_REQUEST_APPROVED'");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}


/** Transaction when the Retailer acknowledges about the software being Delivered.
* @param{org.xyz.iotmlchain.received_by_retailer} rbr
* @transaction
*/


function receivedByRetailer(rbr){
  let reqStatus = rbr.software;
  if(reqStatus.request == 'IN_DELIVERY_RETAILER')
  {
    reqStatus.request = 'RECEIVED_RETAILER';
    reqStatus.state = 'FINAL_PROCESS_RETAILER';
    reqStatus.owner ='IOT1';
  }
  
  else if(reqStatus.request != 'IN_DELIVERY_RETAILER')
  {
    throw new window.alert("Submit this transacion only if the requeststatus is set to 'IN_DELIVERY_RETAILER'");
  }
  
  return getAssetRegistry('org.xyz.iotmlchain.Software')
    .then(function updateRegistry(assetRegistrySoftware)
          {return assetRegistrySoftware.update(reqStatus)});
}


/** Transaction when the software are retail ready.
* @param{org.xyz.iotmlchain.available_for_sale} afs
* @transaction
*/

function retailReady(afs){
  let softwareAsset = afs.software;
  let DID = softwareAsset.did;
  
  if(softwareAsset.owner == 'IOT1' && softwareAsset.state == 'FINAL_PROCESS_RETAILER'){
    forLoopAsync(DID);
    }
  
  else{
    throw new window.alert("Submit this transaction only if the state of the software is ''");
    }
  
   return getAssetRegistry('org.xyz.iotmlchain.Software')
   .then(function deleteDSoftwareAssetAfterItsReady(asset)
    {return asset.remove(softwareAsset)});
   }


async function assignIdToEachSoftware(i,DID){
  let factory = getFactory();
  let NS = 'org.xyz.iotmlchain';
  let t = i.toString();
  let software = factory.newResource(NS, 'Software', DID.toString()+'-P'+t);
  
  software.quantity = '1';
  software.owner = 'IOT1';
  software.state = 'AVAILABLE_FOR_SALE';
  software.request = 'NA';
  software.quantitystate = 'KNOWN';
  
  let softwareRegistry = await getAssetRegistry(NS + '.Software');
  await softwareRegistry.addAll([software]);


    }
async function forLoopAsync(DID){
   let i;
   for(i=1;i<=10;i++){
   await assignIdToEachSoftware(i,DID);
    }
}


/** This is used to initialize the demo resource.
* @param{org.xyz.iotmlchain.initialize_demo_resource} idr
* @transaction
*/

async function demoResource(idr){
  const factory = getFactory();
  const NS = 'org.xyz.iotmlchain';
  
  const DataSc = factory.newResource(NS, 'DataSc','D001');
  DataSc.name = 'Kevin';
  
  const MLtrainer = factory.newResource(NS, 'MLtrainer', 'M001');
  MLtrainer.name = 'Bob';
  
  const iotExporter = factory.newResource(NS, 'iotExporter', 'E001');
  iotExporter.name = 'Russel';
  
  const Iot1 = factory.newResource(NS, 'Iot1', 'R001');
  Iot1.name = 'Peters';
  
  const Software = factory.newResource(NS, 'Software', 'RD1');
  Software.quantity = 'NA';
  Software.owner = 'DATASC';
  Software.state = 'MINING';
  Software.request = 'NA';
  Software.quantitystate = 'RAW';
  
  
  const DataScRegistry = await getParticipantRegistry(NS + '.DataSc');
  await DataScRegistry.addAll([DataSc]);
  
  const MLtrainerRegistry = await getParticipantRegistry(NS + '.MLtrainer');
  await MLtrainerRegistry.addAll([MLtrainer]);
  
  const iotExporterRegistry = await getParticipantRegistry(NS + '.iotExporter');
  await iotExporterRegistry.addAll([iotExporter]);
  
  const Iot1Registry = await getParticipantRegistry(NS + '.Iot1');
  await Iot1Registry.addAll([Iot1]);
  
  const SoftwareRegistry = await getAssetRegistry(NS + '.Software');
  await SoftwareRegistry.addAll([Software])
 }




