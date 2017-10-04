$( document ).on( "mobileinit", function() {
 
pageOnLoad();
displayUom(); // display UOM result, prevent adding data repeatitively

$('#item-add-done').click(validateForm);
$('#take-photo').click(openCamera);
$('#item-image').click(enlargePicture);
$('#choose-image').click(openFilePicker);


});

var db = null;
var dbName = 'itemDB';
var dbVersion = '1.0';
var dbDisplayName = 'Test DB';
var dbSize = 2*1024*1024;

function pageOnLoad(){
empty('#item-list-view');
fnDbInit();
displayItemList();
}

/* function to clear content */
function empty(selector){

        $(selector).empty();
}



/* new large window for picture thumnail,thanks to stackoverflow code */
function enlargePicture(){
        // get the url of the picture we clicked
        var url = $(this).attr('src');
        // get the url of the large image
        var bigUrl = $('#item-large-image').attr('src');
        // change the url of the big picture
        $('#item-large-image').attr('src', url);
        // change the url of this picture
        $(this).attr('src', bigUrl);
}



function fnDbInit() {

  if (window.openDatabase) {
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function(tx) 
        {tx.executeSql("CREATE TABLE IF NOT EXISTS ITEM_LIST(name, quantity, uom, remark, image)")});
    db.transaction(function(tx) 
        {tx.executeSql("CREATE TABLE IF NOT EXISTS UOM(id unique, desc)")});
  }
  else{
    console.log('error');
  }

}


/* add item list */
function addItem() {

var new_name = $('#item-name').val().toLowerCase();
var new_quantity = $('#item-qty').val();
var new_uom = parseInt($('#select-native-15 :selected').val()); //convert to number
var new_remark = $('#item-remark').val();
var new_image = $('#item-image').attr('src');
var add_item_query = 'INSERT INTO ITEM_LIST(name, quantity, uom, remark, image) VALUES (?,?,?,?,?)';

  db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
  db.transaction( function(tx) {
    tx.executeSql(add_item_query,[new_name, new_quantity, new_uom, new_remark, new_image],
        function(tx,result){
            alert('Item saved!');
            console.log('item saved!');
            $('#add-item-page').dialog( "close" );
            resetAddItemForm();
            pageOnLoad();

        });

  },
  function(err){
    console.log(err);
  });   
    
}



function addUom(){

db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
db.transaction(function (tx) {
   tx.executeSql('INSERT INTO UOM (id, desc) VALUES (1, "Pack")');
   tx.executeSql('INSERT INTO UOM (id, desc) VALUES (2, "Bottle")');
   tx.executeSql('INSERT INTO UOM (id, desc) VALUES (3, "Piece")');
   console.log("uom added.")
},
function(err){
    console.log(err);
});
}


/* display uom */
function displayUom(){

db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
db.transaction(function(tx){
    tx.executeSql('SELECT * FROM UOM',[],
        function(tx,result){
            if (result.rows.length == 0) {
                addUom();
            }

        },
        function(err){
            console.log('displaySQL error ' + err);
        });
});
}

/* display item on main page */
function displayItemList(){
var query1 = "SELECT ITEM_LIST.NAME, ITEM_LIST.QUANTITY, ITEM_LIST.IMAGE, UOM.DESC FROM ITEM_LIST ";
var query2 = "INNER JOIN UOM ON UOM.ID=ITEM_LIST.UOM";
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1 + query2,[],
            function(tx,result){
                if (result.rows.length > 0) {
                    for (var i = 0; i < result.rows.length; i++) {
                        $("#item-list-view").append("<li class=\"ui-li-has-thumb ui-first-child\"><a href=\"#edit-item-page\" data-rel=\"dialog\" class=\"ui-btn ui-btn-icon-right ui-icon-carat-r\"><img src=\"" + 
                            result.rows.item(i).image + "\" style=\"padding:5%\"><h2>" + 
                            result.rows.item(i).name + "</h2><p>" + 
                            result.rows.item(i).quantity + " " +
                            result.rows.item(i).desc + "</p></a></li>");

                    }
                    
                    
                }
                else{
                    console.log('No data on item list');
                }
            },
            function(err){
                console.log('display item list error ' + err);
            });
    });
}


/* Cordova Camera */

function setOptions(srcType) {
    var options = {
        // Some common settings are 20, 50, and 100
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        // In this app, dynamically set the picture source, Camera or photo gallery
        sourceType: srcType,
        encodingType: Camera.EncodingType.JPEG,
        mediaType: Camera.MediaType.PICTURE,
        allowEdit: false,
        correctOrientation: true
          //Corrects Android orientation quirks
    }
    return options;
}



function openCamera(selection) {

    var srcType = Camera.PictureSourceType.CAMERA;
    var options = setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);
        

    }, function cameraError(error) {
        console.log('camera '+error);

    }, options);

    $( "#take-photo-dialogue" ).dialog( "close" ); //closing dialog after choosing
}



function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.SAVEDPHOTOALBUM;
    var options = setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);

    }, function cameraError(error) {
        console.log('open image ' + error);

    }, options);

    $( "#take-photo-dialogue" ).dialog( "close" ); //closing dialog after choosing
}


function displayImage(imgUri) {

    var elem = document.getElementById('item-image');
    elem.src = imgUri;
}



/* validate add item form */
function validateForm(){
    if ($('#item-name').val() == "") {
        alert('Please provide item name.');
    }
    else if($('#item-qty').val() == ""){
        alert('Please provide remaining item quantity.');
    }
    else if ($('#item-image').attr('src') == undefined || $('#item-image').attr('src') == "") {
        alert('Please provide item image.')
    }

    else{
        addItem();
    }

}

/* reset add item input field */
function resetAddItemForm(){
$('#item-name').val("")
$('#item-qty').val("");
$('#item-remark').val("");
$('#item-image').attr('src',"");
}


function itemDetails(){
    console.log('item detail');
}