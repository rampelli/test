goog.provide('biq.ahusummary');
biq.ahusummary = new Class({
Binds:["onAhuSummaryGetSuccess"],
Implements: [Events, Options, Class.Occlude],
property:'biq.ahusummary',
/*Global variables declaration Starts*/
options:{
ahuSummaryHeaderObj:{},
headerObj : {},
dataObj : {},
test:"testing",
tempUnits:'C',
setStateRecordId:0,
ifValueIsEmpty: 'No Value',
scrollValue: 0,
ahuSummaryHeader: [],
ahuSummaryHeadersWithUndersore:[],
hiddenCoulmns:[],
DDscrollValueTop:0,
ahusummaryPopUpSubmit: false,
coulmnsPopUpStatus: false,
isTemperature: false
},
/*Global variables declaration ends*/
initialize: function(el,options){
this.element = $(el);
if (this.occlude()) return this.occluded
this.setOptions(options);
this.render();
},
render: function(){
this.onAhuSummaryGetSuccess();
},
/**
* Event binding for AHU Summary.
* @params self [object]
*/
ahuSummaryBindEvents:function(self){
biq.helper.common.getResizable('#resizeMe', '#resizeS', '#resizeContent', 50, 50);
if(biq.loadAhuSummaryRef.tempUnits == "F"){
jq('#fahren').attr('checked', true);
jq('#celsius').attr('checked', false);
}else{
jq('#fahren').attr('checked', false);
jq('#celsius').attr('checked', true);
}
var dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
biq.currentdateTime.currentTime = new Date().format("%H:%M:%S");
biq.currentdateTime.currentDate = new Date().format("%b %d %Y");
if((biq.building.id!=0) || (biq.building.id!="")){
jq( "div#AHUSummary #currentDate" ).datepicker({
dateFormat:"M dd yy"
});
jq('div#AHUSummary #currentTime').timepicker({
showSecond: true,
timeFormat: 'hh:mm:ss',
onClose: function(event){
var ahuTime=event;
var ahuDate=jq("div#AHUSummary input#currentDate").val().trim();
if((ahuTime!="HH:MM:SS")&&(ahuDate!="")){
var constructedDateTime=self.getDateTime(ahuDate,ahuTime);
biq.currentdateTime.currentTime = event;
self.getAHUSummaryDetails(biq.building.id,constructedDateTime);
}
}
});
self.getAhuSummaryColumns(biq.building.id,dateTime);
self.getAHUSummaryDetails(biq.building.id,dateTime);
AHUSummary.AHUSummaryParameterEvents();
AHUSummary.AHUSummarySingleBindEventLiveQuery();
jq( "div#AHUSummary #currentDate" ).datepicker('destroy');
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef=setInterval(function() {
var dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
biq.currentdateTime.currentTime = new Date().format("%H:%M:%S");
biq.currentdateTime.currentDate = new Date().format("%b %d %Y");
self.getAHUSummaryDetails(biq.building.id,dateTime);
}, 30000);
jq("div#AHUSummary div.realTime input.realTimeCheck").click(function(){
var dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
biq.currentdateTime.currentTime = new Date().format("%H:%M:%S");
biq.currentdateTime.currentDate = new Date().format("%b %d %Y");
if(jq("div#AHUSummary div.realTime input.realTimeCheck").is(':checked')){
self.getAHUSummaryDetails(biq.building.id,dateTime);
jq( "div#AHUSummary #currentDate" ).datepicker('destroy');
jq("div#AHUSummary input.locationInput").attr('disabled','disabled');
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef=setInterval(function() {
dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
biq.currentdateTime.currentTime = new Date().format("%H:%M:%S");
biq.currentdateTime.currentDate = new Date().format("%b %d %Y");
self.getAHUSummaryDetails(biq.building.id,dateTime);
}, 30000);
}
else{
jq( "div#AHUSummary #currentDate" ).datepicker({
showOn: "button",
buttonImage: "http://"+biq.serverName+"/portal/Dev/biq/modules/plantsummary/images/icons/calendar.png",
buttonImageOnly: true,
buttonText: "Please Select Date/Time",
dateFormat:"M dd yy",
onSelect: function(dateText, inst) {
var ahuTime=jq("div#AHUSummary input#currentTime").val().trim();
var ahuDate=dateText;
if((ahuTime!="HH:MM:SS")&&(ahuDate!="")){
var constructedDateTime=self.getDateTime(ahuDate,ahuTime);
biq.currentdateTime.currentDate = ahuDate;
self.getAHUSummaryDetails(biq.building.id,constructedDateTime);
}
}
});
jq('div#AHUSummary #currentTime').timepicker({
showSecond: true,
timeFormat: 'hh:mm:ss'
});
jq("div#AHUSummary div.realTime input.realTimeCheck").removeAttr('checked');
jq("div#AHUSummary input.locationInput").removeAttr('disabled');
if(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef){
clearInterval(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef);
};
self.getAHUSummaryDetails(biq.building.id,dateTime);
}
});
}/*else{
alert('Please select building'+biq.building.id);
return false;
}*/
},
/**
* Convert date and time to %d/%m/%Y/%H/%M/%S format
* @params ahuDate [string], ahuTime [string]
* @return string
*/
getDateTime: function(ahuDate,ahuTime){
var self=this;
var ahuDateArray=ahuDate.split(" ");
var monthsArray=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
var ahuDateMonth=self.getMonthIndex(monthsArray,ahuDateArray[0]);
ahuDate=ahuDateArray[1]+"/"+ahuDateMonth+"/"+ahuDateArray[2];
var ahuTimeArray=ahuTime.split(":");
ahuTime=ahuTimeArray[0]+"/"+ahuTimeArray[1]+"/"+ahuTimeArray[2];
return ahuDate+"/"+ahuTime;
},
/**
* Convert month in the datepicker field to corresponding numeric value
* @params monthsArray [array], value [string]
* @return int
*/
getMonthIndex:function(monthsArray, value){
for (var i=0; i < monthsArray.length; i++) {
if (monthsArray[i] == value) {
if(i<9){
var leadingZero="0";
var monthNum=i+1+"";
var monthId= leadingZero+monthNum;
return monthId;
}else{
return i+1;
}
}
}
},
/**
* Set current date and current time to datepicker field and timepicker field respectively.
* Define functions to get AHU Summary Data
* @params buildingId [int], dateTime [string]
*/
getAHUSummaryDetails: function(buildingId,dateTime){
var self = this;
jq('#currentDate').val(biq.currentdateTime.currentDate);
jq('#currentTime').val(biq.currentdateTime.currentTime);
self.getRealTimeStatus(buildingId,dateTime);
self.getbuildingIQControl(buildingId,dateTime);
self.getAHUSummary(buildingId,dateTime);
},
getAhuSummaryColumns:function(buildingId,dateTime){
var self = this;
new biq.helper.request({
resource:'proxy',
noCache:true,
onSuccess:function(response){
self.options.ahuSummaryHeader = response;
},
onFailure:function(errorObj){
biq.helper.common.renderMsgInPopup(errorObj.responseText);
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':'getahucolumns.json?building_id='+buildingId+'&date_time='+dateTime
}
);
},
/**
* Load AHU Summary main container template.
*/
onAhuSummaryGetSuccess: function(responseJson){
var self = this;
require(["text!modules/ahusummary/html/ahusummary.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:self.element
};
biq.helper.template.render(options);
self.ahuSummaryBindEvents(self);
biq.helper.common.setPageTitle();
});
},
/**
* Get RealtimeStatus data from API call
* @params buildingId [int]
*/
getRealTimeStatus: function(buildingId,dateTime){
//var dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
new biq.helper.request({
resource:'proxy',
noCache:true,
onSuccess:this.onRealTimeStatusSuccess
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':'getrts.json?building_id='+buildingId+'&date_time='+dateTime
}
);
},
/**
* Prepare RealTimeStatus object and render RealtimeStatus Template(html)
* @params responseJson [object]
*/
onRealTimeStatusSuccess: function(responseJson){
var self = this;
for(var i=0;i < responseJson.length;i++){
var realTimeStatusResponseObj = {};
var className = "";
var label = responseJson[i].values[0];
var labelLowerCase = label.toLowerCase();
realTimeStatusResponseObj.label = label;
if(realTimeStatusResponseObj.value != ''){
realTimeStatusResponseObj.value = parseFloat(realTimeStatusResponseObj.value).toFixed(2);
}
if(labelLowerCase.search("temperature") != -1){
className = "temperature";
}
realTimeStatusResponseObj.className = className;
responseJson[i].realTimeStatus = realTimeStatusResponseObj;
var realValue = responseJson[i].values[1];
if(realValue != '')
{
realValue = parseFloat(realValue).toFixed(2);
// console.log(realValue);
}
realTimeStatusResponseObj.value = realValue;//(realValue!='') ? realValue.toFixed(2) : '';
}
require(["text!modules/ahusummary/html/realTimeStatus.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:$("realTimeStatusContainer"),
data:responseJson
};
biq.helper.template.render(options);
});
},
/**
* Get BuildingIQControl data from API call
* @params buildingId [int]
*/
getbuildingIQControl: function(buildingId,dateTime){
new biq.helper.request({
resource:'proxy',
noCache:true,
onSuccess:this.onbuildingIQControlSuccess
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':'getbiqstatus.json?building_id='+buildingId+'&date_time='+dateTime
}
);
},
/**
* Prepare buildingIQControl object and render buildingIQControl Template(html)
* @params responseJson [object]
*/
onbuildingIQControlSuccess: function(responseJson){
var self = this;
for(var i=0;i < responseJson.length;i++){
var buildingIQControlResponseObj = {};
/*if(i==2){
var str ="";
str+="<span class='enableBiqOn'><input type='radio' name='biqEnableDisable' value='on' checked='checked' disabled='disabled'> ON</span>";
str+="<span><input type='radio' name='biqEnableDisable' value='off' disabled='disabled'> OFF</span>";
buildingIQControlResponseObj.label = responseJson[i].values[0];
buildingIQControlResponseObj.value = str;
}
else if(i==3){
var pmvStr ="";
pmvStr+="<div class='pmvAuto'><input type='radio' name='pmv_override' value='on' checked='checked' disabled='disabled'><span style='padding:0px 2px;'>AUTO</span></div>";
pmvStr+="<div class='pmvSlideOption'><input type='radio' name='pmv_override' value='off' disabled='disabled'></div>";
pmvStr+="<div style='float: left;'>";
pmvStr+="<div class='sliderRangeBg'>-1</div>";
pmvStr+="<div id='slider'></div>";
pmvStr+="<div class='sliderRangeBg'>+1</div>";
pmvStr+="</div>";
buildingIQControlResponseObj.label = responseJson[i].values[0];
buildingIQControlResponseObj.value = pmvStr;
}
else{*/
buildingIQControlResponseObj.label = responseJson[i].values[0];
buildingIQControlResponseObj.value = responseJson[i].values[1];
if(buildingIQControlResponseObj.value != ''){
buildingIQControlResponseObj.value = parseFloat(buildingIQControlResponseObj.value).toFixed(2);
}
//}
responseJson[i].buildingIQControlInfo = buildingIQControlResponseObj;
}
require(["text!modules/ahusummary/html/buildingiqControl.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:$("biqControllContainer"),
data:responseJson
};
biq.helper.template.render(options);
jq("div#AHUSummary #slider").slider({
disabled:true
});
jq('.biqControllTable').delegate('td','click',function(){
var tdObj = jq(this);
if(jq(tdObj).children().hasClass('Edit')){
var val = jq(tdObj).find('span').html();
if(val == "No Data"){
val = "";
}
tdObj.html('<input type="text" value="'+val+'" class="textEnabled"/>');
jq(".textEnabled").focus();
}
});
jq(".biqControllTable").delegate(".textEnabled", "blur", function(){
var textEnabledObj = this;
var building_id = biq.building.id;
var val = jq(this).val().trim();
var className = "";
var rowName = jq(this).parent().prev().html();
if(val == ""){
val = "No Data";
className = "noData";
jq(textEnabledObj).parent().removeClass("noData");
jq(textEnabledObj).parent().html("<span class='Edit "+className+"'>"+val+"</span>");
jq(textEnabledObj).parent().attr("enabled","false");
}else{
new biq.helper.request({
resource:'proxy',
noCache:true,
async :false,
onSuccess: function(responseJson){
jq(textEnabledObj).parent().removeClass("noData");
jq(textEnabledObj).parent().html("<span class='Edit "+className+"'>"+val+"</span>");
//jq(textEnabledObj).parent().attr("enabled","false");
},
onFailure: function(errorObj){
//biq.helper.common.renderMsgInPopup(errorObj.responseText);
jq(textEnabledObj).parent().removeClass("noData");
jq(textEnabledObj).parent().html("<span class='Edit "+className+"'>"+val+"</span>");
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':encodeURI('EDITSETPOINT.json?building_id='+building_id+'&rowName='+rowName+"&column=CONTROL&value="+val+"&isPopUpParameter=return")
}
);
}
});
});
},
buildingIQControlBindEvents: function(){
/*jq(".biqControllTable").find(".statusValue").each(function(){
jq(this).html("n/a");
});*/
jq('.biqControllTable').delegate('.Edit','click',function(){
//console.log(jq(this));
});
},
/**
* Display no data availabe message if no data exists
*/
noDataAvailable:function(){
jq('div#AHUSummary div.TitleBar span#loader').removeClass("loader");
jq('.ahuSummaryBottomMain .ahuSummaryInfo').html('No data available');
return false;
},
/**
* Get AHU Summary data(Bottom Panel) from API call
* @params buildingId [int], the_date_time [string]
*/
getAHUSummary: function(buildingId,the_date_time){
var self = this;
jq('div#AHUSummary div.TitleBar span#loader').addClass("loader");
new biq.helper.request({
resource:'proxy',
//resource:'ahusummary',
noCache:true,
onSuccess: function(responseJson){
if(responseJson.ConfigNode == undefined){
alert("Empty AHUSummary Response");
return false;
}
var headerArray = new Array();
var headerDetailsArray = new Array();
var headerObj,rowObj;
var i,j,k,p,l;
var data, headerTitle,pointTypeValue,title,pointCommandedState,stateRecordId,parameterParentValue;
var AHUSummaryHeaderConfigNode;
var firstRowObj = {};
var firstRowArray = new Array();
var isSyncedFlag = false;
var headerArrayLength,dataLength,diff,dataConfigNode;
var ahuSummaryRowValue,columnNodeArray;
var rowDetailsArray = new Array();
var rowDetailsNewArray = new Array();
var setPointState = false;
var AHUSummaryConfigNode = responseJson.ConfigNode.ConfigNode;
if(typeof AHUSummaryConfigNode == 'undefined')
{
return self.noDataAvailable();
}
AHUSummaryConfigNode = biq.helper.common.checkIsArrayOrConvertObjectToArray(AHUSummaryConfigNode);
var finalArryData = [];
if(AHUSummaryConfigNode.length > 0){
AHUSummaryHeaderConfigNode = biq.helper.common.checkIsArrayOrConvertObjectToArray(AHUSummaryConfigNode[0].ConfigNode);
AHUSummaryLength = AHUSummaryHeaderConfigNode.length
headerObj = {};
headerObj.columnId = 0;
headerObj.title = "Zone Name";
headerArray.push(headerObj);
// for(i=0; i < AHUSummaryLength;i++){
// headerObj = {};
//
// for(j=0;j<AHUSummaryHeaderConfigNode[i].ActualData.Item.length;j++){
// if(AHUSummaryHeaderConfigNode[i].ActualData.Item[j]['@name'] == "PointTypeName"){
// headerTitle = AHUSummaryHeaderConfigNode[i].ActualData.Item[j]['@value'];
// } // ParameterTypeName
// else if(AHUSummaryHeaderConfigNode[i].ActualData.Item[j]['@name'] == "ParameterTypeName"){
// headerTitle = AHUSummaryHeaderConfigNode[i].ActualData.Item[j]['@value'];
// }
// }
//
// headerObj.columnId = i;
// headerObj.title = headerTitle;
//
// headerDetailsArray.push(headerObj);
// headerArray.push(headerObj);
// }
// if this below code doesnot work or thows error please comment it and uncomment above code @pradeep
if(self.options.ahuSummaryHeader.length > 0)
{
var underscoreTitle;
jq.each(self.options.ahuSummaryHeader,function(index,val){
underscoreTitle = val.replace(/ /g,'_').toLowerCase();
headerObj = {};
headerObj.columnId = index;
headerObj.title = val;
headerObj.coumnClass = underscoreTitle;
headerDetailsArray.push(headerObj);
headerArray.push(headerObj);
self.options.ahuSummaryHeadersWithUndersore[index] = underscoreTitle;
});
}
headerArrayLength = headerArray.length;
var tempArrayWithItsOriginalColumns = [];
var headerColumn = [];
var tempFinalDataArray = [];
for(var n = 1 ; n < (headerArray.length) ; n++)
{
if(headerArray[n].title != null)
headerColumn.push(headerArray[n].title.replace(/ /g,'_').toLowerCase());
else
headerColumn.push(headerArray[n].title);
}
for(i=0;i < AHUSummaryConfigNode.length;i++){
var rowDetailsObj = {};
columnNodeArray = AHUSummaryConfigNode[i].ConfigNode;
data = biq.helper.common.checkIsArrayOrConvertObjectToArray(columnNodeArray);
dataLength = data.length;
if(dataLength < (headerArrayLength - 1)){
diff = parseInt(headerArrayLength)-parseInt(dataLength);
for(p = 0;p<diff;p++){
data[dataLength] = "&nbsp;";
dataLength++;
}
}
var rowArray = new Array();
var className = "";
if(i%2 == 0){
className = "oddRow";
}
rowObj = {};
title = headerArray[0]['title'];
rowObj.row_data = AHUSummaryConfigNode[i]['@name'];
rowObj.class_name = className;
rowObj.column_type = colType;
rowObj.title = title;
rowObj.row_name = AHUSummaryConfigNode[i]['@name'];
firstRowArray.push(rowObj);
try{
tempArrayWithItsOriginalColumns = [];
tempFinalDataArray = [];
for( n = 1 ; n < (headerArray.length) ; n++)
{
// tempFinalDataArray.push(headerArray[n].title.replace(/ /g,'_').toLowerCase());
tempFinalDataArray[headerArray[n].title.replace(/ /g,'_').toLowerCase()] = [];
}
for(j=0;j < data.length;j++){
isSyncedFlag = false;
if(typeof data[j].ActualData == 'undefined')
continue;
dataConfigNode = data[j].ActualData.Item;
var colType = "";
pointCommandedState = "";
parameterParentValue = "";
var parameterCommandedValue = "";
setPointState = false;
for(k=0;k < dataConfigNode.length;k++ ){
if(dataConfigNode[k]['@name'] != "PointCommandedValue" && dataConfigNode[k]['@name'] != "ParameterCommandedValue"){
if(dataConfigNode[k]['@name'] == "PointTypeName" || dataConfigNode[k]['@name'] == "ParameterTypeName"){
pointTypeValue = dataConfigNode[k]['@value'];
}
if(dataConfigNode[k]['@name'] == "PointCommandedState" || dataConfigNode[k]['@name'] == "ParameterCommandedState"){
pointCommandedState = dataConfigNode[k]['@value'];
pointCommandedState = pointCommandedState.toLowerCase();
// setPointState = true; @todo if below setPointState value is not working then need to uncomment this and remove below condition
}
if(dataConfigNode[k]['@name'] == "PointStateRecordId" || dataConfigNode[k]['@name'] == "ParameterStateRecordId")
{
stateRecordId = dataConfigNode[k]['@value'];
}
if(dataConfigNode[k]['@name'] == "ParameterParentValue"){
parameterParentValue = dataConfigNode[k]['@value'];
}
/* Added by Sriram to implement isSynced */
if(dataConfigNode[k]['@name'] == "isSynced"){
if(dataConfigNode[k]['@value'] == 'false'){
isSyncedFlag = true;
}
}
if(dataConfigNode[k]['@name'] == "IsSetPoint" )
{
setPointState = dataConfigNode[k]['@value'];
setPointState = (setPointState == "true") ? 'ahuSummaryZone' : 'ahuSummaryZone';
}
else
if((dataConfigNode[k]['@name'] == "IsPopUpParameter") )
{
if((dataConfigNode[0]['@name'] == "PointStateRecordId")){
setPointState = dataConfigNode[k]['@value'];
setPointState = (setPointState == "true") ? 'ahuSummaryZone' : ((setPointState == "false") ? 'ahuSummaryZone' : (setPointState == "readOnly") ? 'noPopUpReadOnly' : 'noPopUpReadOnly');
}else{
setPointState = dataConfigNode[k]['@value'];
setPointState = (setPointState == "true") ? 'popupEnabled' : ((setPointState == "false") ? 'popupDisabled' : (setPointState == "readOnly") ? 'noPopUpReadOnly' : 'noPopUpReadOnly');
}
}
else
{
setPointState = '';
}
var columnType = dataConfigNode[k]['@value'];
if(typeof columnType !='undefined')
colType = colType+ " "+columnType.toLowerCase();
}else{
if(dataConfigNode[k]['@name'] == "ParameterCommandedValue"){
parameterCommandedValue = dataConfigNode[k]['@value'];
}
if(dataConfigNode[k]['@value'] == ''){
ahuSummaryRowValue = AHUSummary.options.ifValueIsEmpty;
}else{
ahuSummaryRowValue = dataConfigNode[k]['@value'];
}
}
// ParameterCommandedValue
}
rowObj = {};
rowObj.class_name = className;
rowObj.row_data = (ahuSummaryRowValue!=AHUSummary.options.ifValueIsEmpty) ? parseFloat(ahuSummaryRowValue).toFixed(2) : ahuSummaryRowValue;
rowObj.column_type = colType;
// console.log(pointTypeValue);
// console.log(headerDetailsArray[j]['title']);
rowObj.title = pointTypeValue;//headerDetailsArray[j]['title'];
rowObj.pointCommandedState = pointCommandedState;
rowObj.pointStateRecordId = stateRecordId;
rowObj.ahuSummaryZone = setPointState;
rowObj.isSyncedFlag = isSyncedFlag;
rowObj.columnClass = pointTypeValue.replace(/ /g,'_').toLowerCase();
rowObj.parameterParentValue = parameterParentValue;
rowObj.parameterCommandedValue = parameterCommandedValue;
rowObj.row_name = AHUSummaryConfigNode[i]['@name'];
// jq.each(tempFinalDataArray,function(index,val){
// if(val == pointTypeValue.replace(/ /g,'_').toLowerCase())
// {
//
// }
// tempFinalDataArray[index][pointTypeValue.replace(/ /g,'_').toLowerCase()] = rowObj
// });
tempFinalDataArray[pointTypeValue.replace(/ /g,'_').toLowerCase()] = rowObj;
// console.log(tempFinalDataArray);
rowArray[j] = rowObj;
}
}
catch(e)
{
biq.helper.common.logIt(e, 'error');
}
rowDetailsObj.class_name = className;
rowDetailsObj.ahuSummaryInfo = rowArray;
var finalCount = 0;
var checkedIs = false;
var finalArrayObjResult = [];
jq.each(headerColumn,function(index,val){
for (g in tempFinalDataArray) {
if(g == val)
{
checkedIs = true;
finalCount++;
if(typeof tempFinalDataArray[g].row_data !='undefined') // if there is no value for perticulat obj then need to create an empty object with columnClass as this is used in hide/show column's
finalArrayObjResult.push(tempFinalDataArray[g]);
else
{
var tempObj;
tempObj = {};
tempObj.columnClass = val;
tempObj.row_data = '&nbsp;';
finalArrayObjResult.push(tempObj);
}
// console.log(biq.helper.common.isEmpty(tempFinalDataArray[g]));
// console.log(finalArrayObjResult);
}
}
if(checkedIs == false)
{
tempObj = {};
tempObj.columnClass = val;
finalArrayObjResult.push(tempObj);
}
});
rowDetailsObj.newAhuSummaryInfo = finalArrayObjResult;
rowDetailsObj.headerColumn = headerColumn;
rowDetailsArray[i] = rowDetailsObj;
// rowDetailsNewArray[i]=tempFinalDataArray;
}
firstRowObj.firstRowHeader = headerArray[0];
firstRowObj.firstRowInfo = firstRowArray;
var ahuSummaryData = {};
ahuSummaryData.firstRow = firstRowObj;
ahuSummaryData.ahuSummaryDetails = rowDetailsArray;
ahuSummaryData.ahuSummaryHeaderDetails = headerDetailsArray;
}
//console.log(ahuSummaryData)
require(["text!modules/ahusummary/html/ahusummaryinfo.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:$("ahuSummaryInfo"),
data:ahuSummaryData
};
biq.helper.template.render(options);
jq("#table_div").scroll(function(){
self.fnScroll();
}).scrollLeft(self.options.scrollValue).scrollTop(self.options.scrollValueTop);
jq('div#AHUSummary div.TitleBar span#loader').removeClass("loader");
self.AHUSummaryEventBind();
if(jq("#AHUSummary .buildingsTreeViewCollapseDiv").hasClass('buildingsTreeViewMinimise')){
jq("#table_div").removeClass("tableDiv").addClass("tableDivMaximise");
jq("#divHeader").removeClass("divHeader").addClass("divHeaderMaximise");
}
});
},
onFailure: function(error){
biq.helper.common.logIt(error, 'error');
return self.noDataAvailable();
jq('div#AHUSummary div.TitleBar #loader').removeClass("loader");
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':'getahu.json?building_id='+buildingId+'&date_time='+the_date_time
}
);
},
captureScrollPositionHorizontal:function(){
var self = this;
var listObj = jq('.list-columns-ahusummary');
listObj.scroll(function(){
self.options.DDscrollValueTop = listObj.scrollTop();
});
listObj.scrollTop(self.options.DDscrollValueTop);
},
/**
* show coulmns dropdown if its opened in the previous session
*/
hideShowColumnsDorpDown:function(){
var self = this;
if(self.options.coulmnsPopUpStatus)
{
jq('.list-columns-ahusummary').show();
self.captureScrollPositionHorizontal();
self.bindCheckBoxClickEvent();
}
},
/** enable column hide show option for ahusummary
*
*/
bindCheckBoxClickEvent:function(){
var self = this;
jq('.list-columns-ahusummary').find('input').unbind().click(function(){
var thisInputObj = jq(this);
var checkBoxValue = thisInputObj.val();
var columnName = self.options.ahuSummaryHeadersWithUndersore[checkBoxValue];
var columnsCount = self.options.ahuSummaryHeadersWithUndersore.length;
var tdObject = jq('.'+columnName+'coulmnToggle');
if(!thisInputObj.is(':checked')){
if(columnsCount - self.options.hiddenCoulmns.length == 1)
{
return false;
}
tdObject.hide();
self.options.hiddenCoulmns.push(columnName)
}
else
{
var indexToDelete;
indexToDelete = jq.inArray( columnName, AHUSummary.options.hiddenCoulmns );
if(indexToDelete > -1)
{
self.options.hiddenCoulmns.splice(indexToDelete, 1);
tdObject.show();
}
}
});
},
setCoulmnShowHide:function(){
var self = this;
var columnId;
var columnsDDstatus;
self.autoHideColumns();
// self.hideShowColumnsDorpDown();
// jq('#ahuSummaryInfo')
jq('.ahuSummaryBottomMain').delegate('.column-selection','click',function(){
columnsDDstatus = self.options.coulmnsPopUpStatus;
var thisObj = jq(this);
if(columnsDDstatus != true)
{
self.options.coulmnsPopUpStatus = true;
}
else
self.options.coulmnsPopUpStatus = false;
jq('.list-columns-ahusummary').slideToggle("fast");//.show();
var listObj = jq('.list-columns-ahusummary');
listObj.scroll(function(){
self.options.DDscrollValueTop = listObj.scrollTop();
});
self.bindCheckBoxClickEvent();
});
},
// auto hide the hidden columns on reload
autoHideColumns:function(){
var self = this;
for(var i=0;i<self.options.hiddenCoulmns.length;i++ ){
jq('.'+self.options.hiddenCoulmns[i]+'coulmnToggle').hide();
jq('.'+self.options.hiddenCoulmns[i]+'whs').removeAttr('checked');
}
},
ifStaticValueThenSet:function(value,staticValue)
{
if(value == staticValue)
{
return '';
}
return value;
},
ifNullSetDefault:function(value,staticValue)
{
if(value == '')
{
return staticValue;
}
return value;
},
/** when clicked on popup then the below method is invoked
* @param ahuSummaryTdObj stores the object of the clicked td
*/
onPopUpDisabledClick:function(ahuSummaryObj,ahuSummaryTdObj){
//var ahuSummaryContentObj = ahuSummaryTdObj.children();
var ahuSummaryContentObj = ahuSummaryTdObj.find('div');
var val = ahuSummaryObj.ifStaticValueThenSet(ahuSummaryContentObj.text().trim(),AHUSummary.options.ifValueIsEmpty);
var id = ahuSummaryTdObj.attr('recid');
var textField = '<input type="text" name="field_'+id+'" id="field_'+id+'" field_id="'+id+'" value="'+val+'" class="ahusummary textEnabled"/>';
ahuSummaryContentObj.html(textField);
ahuSummaryTdObj.removeClass('popupDisabled');
jq('#ahuSummaryInfo .textEnabled').focus();
jq('#ahuSummaryInfo .textEnabled').unbind().bind('blur',function(){
var thisObj = jq(this);
ahuSummaryObj.onEditBlurUpdateData(ahuSummaryContentObj,ahuSummaryTdObj,thisObj);
});
},
/** Events to bind when the table data is rendered or the dom is ready
*/
AHUSummaryParameterEvents:function()
{
var ahuSummaryObj = this;
//jq('#ahuSummaryInfo')
jq('.ahuSummaryBottomMain').undelegate().delegate('.popupDisabled','click',function(){
ahuSummaryObj.onPopUpDisabledClick(ahuSummaryObj,jq(this));
});
ahuSummaryObj.parameterOnPopupEnabled();
ahuSummaryObj.setCoulmnShowHide();
},
parameterOnPopupEnabled: function(){
var ahuSummaryObj = this;
var AHUSummarySingleNodeRecordObj = {};
jq('.ahuSummaryBottomMain').delegate('.popupEnabled','click',function(){
var ahuSummaryTdObj = jq(this);
//var ahuSummaryContentObj = ahuSummaryTdObj.children();
var ahuSummaryContentObj = ahuSummaryTdObj.find('div');
var val = ahuSummaryObj.ifStaticValueThenSet(ahuSummaryContentObj.text().trim(),AHUSummary.options.ifValueIsEmpty);
var id = ahuSummaryTdObj.attr('recid');
var parameterParentValue = ahuSummaryTdObj.attr('parameterParentValue');
var parameterCommandedValue = ahuSummaryTdObj.attr('parameterCommandedValue');
var overrideStatus = false;
AHUSummarySingleNodeRecordObj.parameterParentValue = parameterParentValue;
if(parameterParentValue!=parameterCommandedValue){
AHUSummarySingleNodeRecordObj.parameterCommandedValue = parameterCommandedValue;
overrideStatus=true;
AHUSummarySingleNodeRecordObj.override = overrideStatus;
}else{
overrideStatus=false;
AHUSummarySingleNodeRecordObj.override = overrideStatus;
AHUSummarySingleNodeRecordObj.parameterCommandedValue = "";
}
require(["text!modules/ahusummary/html/editparameter.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:$("editSetpramaterForm"),
data: AHUSummarySingleNodeRecordObj
};
biq.helper.template.render(options);
jq( ".editSetpramaterDiv" ).dialog({
autoOpen: true,
modal: true,
resizable: false,
minWidth: 300,
maxHeight: 630,
draggable: true,
drag: function(event, ui) {
jq(window).trigger("resize");
},
open: function(event, ui) {
ahuSummaryObj.parameterOnDialogOpenBindEvents(ahuSummaryContentObj,ahuSummaryTdObj,AHUSummarySingleNodeRecordObj);
},
close:function(){
var str = "<div class='editSetpramaterDiv'><div id='editSetpramaterForm'></div></div>";
jq("#editSetpramaterDialog").html(str);
jq(".ui-dialog .editSetpramaterDiv").remove();
}
});
var isOverride = jq('#override').is(':checked');
ahuSummaryObj.enableParameterFields(isOverride);
});
});
},
parameterOnDialogOpenBindEvents:function(ahuSummaryContentObj,ahuSummaryTdObj,AHUSummarySingleNodeRecordObj)
{
var ahuSummaryObj = this;
var buildingId = biq.building.id;
var rowName = ahuSummaryContentObj.attr('row_name');
var columnName = ahuSummaryContentObj.attr('column_title');
var parameterValue;
var isPopUpParameterVal;
jq('#override').expire().livequery('click',function(){
var isOverride = jq('#override').is(':checked');
ahuSummaryObj.enableParameterFields(isOverride);
});
jq('.submitParameter').expire().livequery('click',function(){
var overrideValue = 0;
if( jq("input#override").is(':checked')){
parameterValue = jq('#parametervalue').val();
isPopUpParameterVal = "true";
}else{
parameterValue = jq('#global').val();
isPopUpParameterVal = "return";
}
//var parameterValue = jq('#parametervalue').val();
new biq.helper.request({
resource:'proxy',
noCache:true,
async :false,
onSuccess: function(responseJson){
if(responseJson.second == "Success"){
jq( ".editSetpramaterDiv" ).dialog('close');
if(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef){
clearInterval(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef);
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef = '';
}
// get ahu summary details
ahuSummaryObj.setIntervalAhuSummary();
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef=setInterval(function() {
// get ahu summary details
ahuSummaryObj.setIntervalAhuSummary();
}, 30000);
}else{
biq.helper.common.renderMsgInPopup("EditSetPoint failed.");
jq( ".editSetpramaterDiv" ).dialog('close');
}
//parameterValue = ahuSummaryObj.ifNullSetDefault(parameterValue,AHUSummary.options.ifValueIsEmpty);
//ahuSummaryContentObj.html(parameterValue);
},
onFailure: function(error){
parameterValue = ahuSummaryObj.ifNullSetDefault(parameterValue,AHUSummary.options.ifValueIsEmpty);
ahuSummaryContentObj.html(parameterValue);
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':encodeURI('EDITSETPOINT.json?building_id='+buildingId+'&rowName='+rowName+'&column='+columnName+'&value='+parameterValue+'&isPopUpParameter='+isPopUpParameterVal)
}
);
});
},
onEditBlurUpdateData:function(ahuSummaryContentObj,ahuSummaryTdObj,thisObj){
var ahuSummaryObj = this;
var buildingId = biq.building.id;
var rowName = ahuSummaryContentObj.attr('row_name');
var columnName = ahuSummaryContentObj.attr('column_title');
var modefiedValue = thisObj.val().trim();
modefiedValue = ahuSummaryObj.convertToCelsiusIfChecked(ahuSummaryTdObj.find('div').hasClass('temperature'),modefiedValue);
new biq.helper.request({
resource:'proxy',
noCache:true,
async :false,
onSuccess: function(responseJson){
thisObj.remove();
modefiedValue = ahuSummaryObj.convertToFahrenheitIfChecked(ahuSummaryTdObj,modefiedValue);
modefiedValue = ahuSummaryObj.ifNullSetDefault(modefiedValue,AHUSummary.options.ifValueIsEmpty);
ahuSummaryContentObj.html(modefiedValue);
ahuSummaryTdObj.addClass('popupDisabled');
},
onFailure: function(error){
thisObj.remove();
modefiedValue = ahuSummaryObj.convertToFahrenheitIfChecked(ahuSummaryTdObj,modefiedValue);
modefiedValue = ahuSummaryObj.ifNullSetDefault(modefiedValue,AHUSummary.options.ifValueIsEmpty);
ahuSummaryContentObj.html(modefiedValue);
ahuSummaryTdObj.addClass('popupDisabled');
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':encodeURI('EDITSETPOINT.json?building_id='+buildingId+'&rowName='+rowName+'&column='+columnName+'&value='+modefiedValue+'&isPopUpParameter=false')
}
);
},
/**
*
*/
AHUSummarySingleBindEventLiveQuery:function(){
var currentAhuSummaryZoneObj;
var ahuSummaryObj = this;
jq('.ahuSummaryBottomMain').delegate('.ahuSummaryZone','click',function(){
var thisElement = this;
currentAhuSummaryZoneObj = jq(thisElement);
ahuSummaryObj.options.isTemperature = currentAhuSummaryZoneObj.find('div').hasClass('temperature');
var row_name = jq(thisElement).attr("row_name");
var column_title = jq(thisElement).attr("column_title");
var controlledType = jq(thisElement).attr("class");
var pointStateRecordId = jq(thisElement).attr("recid");
ahuSummaryObj.options.setStateRecordId = pointStateRecordId;
new biq.helper.request({
resource:'proxy',
// resource:'ahugetone',
noCache:true,
onSuccess: function(responseJson){
if(responseJson.ConfigNode == undefined){
alert("Empty AHUSummary Response");
return false;
}
var AHUSummarySingleNode = responseJson.ConfigNode.ConfigNode.ConfigNode;
var AHUSummarySingleNodeData = AHUSummarySingleNode.ActualData.Item;
var AHUSummarySingleNodeRecord = {};
var AHUSummarySingleArray = new Array();
for(var k=0;k < AHUSummarySingleNodeData.length; k++)
{
AHUSummarySingleNodeRecord[AHUSummarySingleNodeData[k]['@name']] = AHUSummarySingleNodeData[k]['@value'];
}
if(AHUSummarySingleNodeRecord.LastResetError == undefined)
AHUSummarySingleNodeRecord.LastResetErrorExists = false;
else
AHUSummarySingleNodeRecord.LastResetErrorExists = true;
if((AHUSummarySingleNodeRecord.IsSetPoint == "true") || (AHUSummarySingleNodeRecord.IsPopUpParameter == "true"))
{
AHUSummarySingleNodeRecord.SetPoint = "block";
AHUSummarySingleNodeRecord.ReadPoint = "none";
AHUSummarySingleNodeRecord.IsSetPoint = true;
}
else
{
AHUSummarySingleNodeRecord.SetPoint = "none";
AHUSummarySingleNodeRecord.ReadPoint = "block";
AHUSummarySingleNodeRecord.IsSetPoint = false;
}
AHUSummarySingleNodeRecord.LastReadValue = ahuSummaryObj.convertToFahrenheitIfChecked(currentAhuSummaryZoneObj,AHUSummarySingleNodeRecord.LastReadValue);
AHUSummarySingleNodeRecord.PointCommandedValue = ahuSummaryObj.convertToFahrenheitIfChecked(currentAhuSummaryZoneObj,AHUSummarySingleNodeRecord.PointCommandedValue);
AHUSummarySingleNodeRecord.LastWrittenValue = ahuSummaryObj.convertToFahrenheitIfChecked(currentAhuSummaryZoneObj,AHUSummarySingleNodeRecord.LastWrittenValue);
require(["text!modules/ahusummary/html/editsetpoint.html!strip","i18n!modules/ahusummary/nls/biq.ahusummary.i18n"],function(html,language){
var options = {
tpl: html,
lang: language,
element:$("editSetpointForm"),
data: AHUSummarySingleNodeRecord
};
biq.helper.template.render(options);
jq( ".editSetpointDiv" ).dialog({
autoOpen: true,
modal: true,
resizable: false,
minWidth: 580,
maxHeight: 630,
draggable: true,
drag: function(event, ui) {
jq(window).trigger("resize");
},
open: function(event, ui) {
jq("#editSetPointTable #row_name").val(row_name)
jq("#editSetPointTable #column").val(column_title)
// toggle events
//@todo need to remove the code
jq(".pointstate-heading").click(function(){
var spanObj = jq(this).prev();
if(spanObj.hasClass( "ui-icon-plus" ))
{
spanObj.removeClass("ui-icon-plus").addClass("ui-icon-minus");
jq(this).next().show();
}
else
{
spanObj.removeClass("ui-icon-minus").addClass("ui-icon-plus");
jq(this).next().hide();
}
});
if(AHUSummarySingleNodeRecord.PointCommandedState == 'BiqControlled')
{
jq("#biq_controlled")[0].checked = true;
}
if(AHUSummarySingleNodeRecord.PointCommandedState == 'BmsControlled')
{
jq("#bms_controlled")[0].checked = true;
}
if(AHUSummarySingleNodeRecord.PointCommandedState == 'Forced')
{
jq('.reportedState').val(AHUSummarySingleNodeRecord.PointCommandedState);
jq("#force")[0].checked = true;
jq("#force_value").removeAttr('disabled');
var commandValue = 0;
if(typeof AHUSummarySingleNodeRecord.PointCommandedValue == 'undefined')
{
commandValue = AHUSummarySingleNodeRecord.LastReadValue;
}
else
{
commandValue = AHUSummarySingleNodeRecord.PointCommandedValue;
}
var testValue;
if(commandValue!='')
testValue = parseFloat(commandValue).toFixed(2);
else
testValue = commandValue;
if(testValue == '-0.00')
{
testValue = '0.00';
}
jq("#force_value").val(testValue);
}
ahuSummaryObj.editPointSetEventsBind();
ahuSummaryObj.editPointSetSubmitBind();
// by default enable the radio button
// if(biq.helper.common.checkStringContains(controlledType, 'biqcontrolled'))
// jq("#biq_controlled")[0].checked = true;
// else
// if(biq.helper.common.checkStringContains(controlledType, 'bmscontrolled'))
// jq("#bms_controlled")[0].checked = true;
// else
// if(biq.helper.common.checkStringContains(controlledType, 'forced'))
// {
// jq("#force")[0].checked = true;
// jq("#force_value").removeAttr('disabled');
// jq("#force_value").val(AHUSummarySingleNodeRecord.LastReadValue);
// }
},
close: function(event, ui){
if(ahuSummaryObj.options.ahusummaryPopUpSubmit)
{
if(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef){
clearInterval(biq.loadAhuSummaryRef.loadAhuSummaryTimerRef);
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef = '';
}
ahuSummaryObj.setIntervalAhuSummary();
biq.loadAhuSummaryRef.loadAhuSummaryTimerRef=setInterval(function() {
ahuSummaryObj.setIntervalAhuSummary();
}, 30000);
}
ahuSummaryObj.options.ahusummaryPopUpSubmit = false;
var str = "<div id='editSetpointDiv' class='editSetpointDiv'><div id='editSetpointForm'></div></div>";
jq("#editSetpointDialog").html(str);
jq(".ui-dialog .editSetpointDiv").remove();
}
});
});
},
onFailure: function(error){
biq.helper.common.logIt(error, 'warn');
jq('div#AHUSummary div.TitleBar #loader').removeClass("loader");
biq.helper.common.renderMsgInPopup(error.responceText);
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':'getoneahu.json?point_state_record_id='+pointStateRecordId
}
);
});
ahuSummaryObj.changeTemperatureType();
},
/** Temperature changing event Bind for radio buttons
*/
changeTemperatureType:function(){
var ahuSummaryObj = this;
var tempUnits = biq.loadAhuSummaryRef.tempUnits;
jq('input[name=temp_units]:radio').unbind().bind("change",function(){
tempUnits = jq('input[name=temp_units]:checked').val();
biq.loadAhuSummaryRef.tempUnits = tempUnits;
ahuSummaryObj.changeTemperatureUnits(tempUnits);
});
},
/**
*binding events for editpoint set when a popupwindow opens
*/
editPointSetEventsBind:function(){
// jq("#editSetPointTable input[name=point_state]:radio").expire().livequery('click',function(){
jq("#editSetPointTable input[name=point_state]:radio").click(function(){
var val = jq(this).val();
if(val == 'Forced')
{
jq('#force_value').removeAttr('disabled').focus();
}
else
{
jq('#force_value').attr('disabled','diasbled');
}
jq('#reportedState').val(jq(this).val());
return true;
});
},
/** Bind Click event binding
*/
editPointSetSubmitBind:function(){
var ahuSummaryObj = this;
//jq("#editSetPointTable .submitBtn").livequery("click",function(){
jq("#editSetPointTable .submitBtn").click(function(){
biq.helper.common.logIt('Clicked on submit button');
var buildingId = biq.building.id;
var row_name = jq("#editSetPointTable #row_name").val();
var column = jq("#editSetPointTable #column").val();
var val = jq('input[name=point_state]:checked', '#editSetPointTableForm').val();
var updatedReport = {};
updatedReport.reportedState = jq('#reportedState').val();
// check which is checked
if(updatedReport.reportedState =='Forced')
{
updatedReport.stateValue = jq('#force_value').val();
if(updatedReport.stateValue == '')
{
biq.helper.common.renderMsgInPopup('Please enter Forced value');
return ;
}
}
else{
updatedReport.stateValue = '';//jq('#LastWrittenValue').val()
}
updatedReport.stateValue = ahuSummaryObj.convertToCelsiusIfChecked(ahuSummaryObj.options.isTemperature,updatedReport.stateValue);
var updatedStringObject = '{"ConfigNode":{"@name":"Monitor Group","ActualData":{"Item":{"@value":"MONITOR","@name":"module"}},"ConfigNode":[{"@id":"'+ahuSummaryObj.options.setStateRecordId+'","@name":"gee","ActualData":{"Item":[{"@value":"'+updatedReport.reportedState+'","@name":"PointCommandedState"},{"@value":"'+updatedReport.stateValue+'","@name":"PointCommandedValue"}]}}]}}';
var dataStr = "&api="+biq.app.getMonitorApiUrl()+"&call=updateoneahu.json&data="+updatedStringObject;
biq.helper.common.sendRequest({
resource: 'proxy_save_post',
data:dataStr,
method:'post',
noCache:true,
async :false,
onSuccess: function(responseJson){
biq.helper.common.logIt('Success');
var finalResult = biq.helper.common.getResponseCode(responseJson);
if(finalResult == 'OK')
{
ahuSummaryObj.options.ahusummaryPopUpSubmit = true;
jq( ".editSetpointDiv" ).dialog('close');
//currentAhuSummaryZoneObj.trigger('click'); asked by jermmy to reload popup and not to reload again
return ;
}
else
{
biq.helper.common.renderMsgInPopup('Update failed.');
}
},
onFailure: function(errorObj){
biq.helper.common.renderMsgInPopup(errorObj.responseText);
}
},true);
/*
*if(val == 3){
val = jq("#editSetPointTableForm #force_value").val();
}
*new biq.helper.request({
resource:'proxy',
noCache:true,
onSuccess:function(responseJson){
var msg = "updated Successfully";
biq.helper.common.renderMsgInPopup(msg);
ahuSummaryObj.ahuSummaryBindEvents(ahuSummaryObj);
},
onFailure: function(errorObj){
var msg = errorObj.responseText;
if(msg == ""){
msg = "Edit SetPoint failed.";
}
biq.helper.common.renderMsgInPopup(msg);
}
},
true
).post(
{
'api':biq.app.getMonitorApiUrl(),
'call':encodeURI('EDITSETPOINT.json?building_id='+buildingId+'&rowName='+row_name+'&column='+column+'&value='+val)
});*/
});
},
AHUSummaryEventBind: function(){
// set the second table height this is written as max-height doesnot work for ie
if(typeof jq.browser.msie!='undefined' && jq.browser.version == '8.0')
jq('#AHUSummary .tableDiv').height((jq('.ahuSummaryTableFirstCol').height()) > jq('.ahuSummaryBottomMain #firstcol').height() ? jq('.ahuSummaryBottomMain #firstcol').height()+18 : jq('.ahuSummaryTableFirstCol').height()+18);
var ahuSummaryObj = this;
var tempUnits;
var currentAhuSummaryZoneObj;
var isTemperature;
jq('#table_div').scroll(function(){
ahuSummaryObj.options.scrollValue = jq('#table_div').scrollLeft();
ahuSummaryObj.options.scrollValueTop = jq('#table_div').scrollTop();
});
// jq(".ahuSummaryZone").click(function(){ // nov 29
//jq("#ahuSummaryInfo")
// jq('.ahuSummaryBottomMain').live_single('.ahuSummaryZone','click',function(element){
// ahuSummaryObj.AHUSummarySingleBindEventLiveQuery();
// if parameters are passed then aply these events
// @todo need to remove the below comment if it doesnot work
//ahuSummaryObj.AHUSummaryParameterEvents();
//shoe columns dropdown
ahuSummaryObj.hideShowColumnsDorpDown();
// jq("#editSetPointTable .submitBtn").expire();
// jq('input[name=temp_units]:radio').expire();
tempUnits = biq.loadAhuSummaryRef.tempUnits;
if(tempUnits == 'F'){
ahuSummaryObj.changeTemperatureUnits(tempUnits);
}
},
// check if Fahrenheit is checked and send the the converted data
convertToCelsiusIfChecked:function(isTemperature,value){
if(jq('#fahren').is(':checked') && isTemperature)
{
value = biq.helper.common.convertFahrenheitToCelsius(value).toFixed(2);
if(value == '-0.00')
{
value = '0.00';
}
}
return value;
},
// check if Fahrenheit is checked and send the the converted data
convertToFahrenheitIfChecked:function(currentAhuSummaryZoneObj,value){
if(jq('#fahren').is(':checked') && currentAhuSummaryZoneObj.find('div').hasClass('temperature') && typeof value!= 'undefined')
{
value = biq.helper.common.convertCelsiusToFahrenheit(value).toFixed(2);
if(value == '-0.00')
{
value = '0.00';
}
}
return value;
},
setIntervalAhuSummary:function(){
var dateTime = new Date().format("%d/%m/%Y/%H/%M/%S");
biq.currentdateTime.currentTime = new Date().format("%H:%M:%S");
biq.currentdateTime.currentDate = new Date().format("%b %d %Y");
this.getAHUSummaryDetails(biq.building.id,dateTime);
},
changeTemperatureUnits: function(tempUnits){
var str,convertedStr,convertedVal,tempVal;
jq(".ahuSummaryTable").find(".temperature").each(function(){
tempVal = jq(this).html().trim();
if(biq.helper.common.isNumber(tempVal)){
if(tempUnits == "C"){
convertedVal = biq.helper.common.convertFahrenheitToCelsius(tempVal);
}else{
convertedVal = biq.helper.common.convertCelsiusToFahrenheit(tempVal);
}
var value = convertedVal.toFixed(2);
if(value == '-0.00')
{
value = '0.00';
}
jq(this).html(value);
}
});
//TODO - Need to test
jq(".realTimeStatusTable").find(".temperature").each(function(){
tempVal = jq(this).html().trim();
if(biq.helper.common.isNumber(tempVal)){
if(tempUnits == "C"){
convertedVal = biq.helper.common.convertFahrenheitToCelsius(tempVal);
}else{
convertedVal = biq.helper.common.convertCelsiusToFahrenheit(tempVal);
}
jq(this).html(convertedVal.toFixed(2));
}
});
},
/**
* Make AHU Summary data(Bottom Panel) table scrollable
*/
fnScroll : function(){
jq('#divHeader').scrollLeft(jq('#table_div').scrollLeft());
jq('#firstcol').scrollTop(jq('#table_div').scrollTop());
},
enableParameterFields: function(isOverride){
if(isOverride){
jq("#global").attr("disabled","disabled");
jq("#parametervalue").removeAttr("disabled");
}else{
jq("#parametervalue").attr("disabled","disabled");
jq("#global").removeAttr("disabled");
}
}
});
var AHUSummary;
window.addEvent('biq.ahusummary',function(el){
AHUSummary = new biq.ahusummary(el);
});
