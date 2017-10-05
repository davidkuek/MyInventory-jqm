$( document ).on( "mobileinit", function() {
 

pageOnLoad();


$('#item-add-done').click(validateForm);
$('#take-photo').click(openCamera);
$('#item-image').click(enlargePicture);
$('#edit-item-image').click(enlargePicture);
$('#choose-image').click(openFilePicker);
$('#refresh-button').click(refresh);


});

var db = null;
var dbName = 'itemDB';
var dbVersion = '1.0';
var dbDisplayName = 'Test DB';
var dbSize = 2*1024*1024;

function pageOnLoad(){
fnDbInit();
empty('#item-list-view');
resetAddItemForm();
displayItemList();  
}

/* function to clear content */
function empty(selector){

        $(selector).empty();
}

function refresh(){
    location.reload(true);
}

function stopRefreshPage(){
    clearTimeout(refresh);
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
        {tx.executeSql("CREATE TABLE IF NOT EXISTS ITEM_LIST(id integer primary key autoincrement, name, quantity, uom, remark, image)")});
    db.transaction(function(tx) 
        {tx.executeSql("CREATE TABLE IF NOT EXISTS UOM(id integer primary key autoincrement, desc)")});
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
            pageOnLoad();
            $('#add-item-page').dialog( "close" ); 
            
        });

  },
  function(err){
    console.log(err);
  });   
  displayUom(); // display UOM result, prevent adding data repeatitively
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
            if (result.rows.length != 0) {
                return;
            }
            else{
                addUom();
            }

        },
        function(err){
            console.log('display UOM error ' + err);
        });
});
}

/* display item on main page */
function displayItemList(){
var query1 = "SELECT ITEM_LIST.NAME, ITEM_LIST.quantity,ITEM_LIST.ID, ITEM_LIST.IMAGE, UOM.DESC FROM ITEM_LIST ";
var query2 = "INNER JOIN UOM ON UOM.ID=ITEM_LIST.UOM";
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1 + query2,[],
            function(tx,result){
                if (result.rows.length < 0) {
                    
                    console.log('No data on item list.');
                }
                else{
                    for (var i = 0; i < result.rows.length; i++) {
                        var item_id = result.rows.item(i).id;
                        $("#item-list-view").append("<li class=\"ui-li-has-thumb ui-first-child item-list-display\" onclick = \"loadItemDetails(" +
                            item_id + ")\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r item-list\"><img src=\"" + 
                            result.rows.item(i).image + "\" style=\"margin:5px\"><h2>" + 
                            result.rows.item(i).name + "</h2><p>" + 
                            result.rows.item(i).quantity + " " +
                            result.rows.item(i).desc + "</p></a></li>");
                    }
                    
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
    var query = "SELECT * FROM ITEM_LIST";
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query,[],
            function(tx,result){
                if (result.rows.length > 0) {

                    // for (var i = 0; i < result.rows.length; i++) {
                        
                    // }
                    
                    
                }
                else{
                    console.log('No data on item list');
                }
            },
            function(err){
                console.log('item details sql error ' + err);
            });
    });

}


function loadItemDetails(item_id){

var query1 = "SELECT ITEM_LIST.NAME, ITEM_LIST.QUANTITY, ITEM_LIST.ID, ITEM_LIST.IMAGE, ITEM_LIST.REMARK, ITEM_LIST.UOM FROM ITEM_LIST ";
// var query2 = "INNER JOIN UOM ON UOM.ID=ITEM_LIST.UOM";
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1,[],
            function(tx,result){
                if (result.rows.length < 0) {
                    
                    console.log('No data on item list.');
                }
                else{
                    
                    for (var i = 0; i < result.rows.length; i++) {
                        
                        if(item_id == result.rows.item(i).id){
                            var name = result.rows.item(i).name
                            var quantity = result.rows.item(i).quantity;
                            var uom = result.rows.item(i).uom;
                            var uomString = uom.toString(); // convert uom result number to string format
                            var remark = result.rows.item(i).remark;
                            var image = result.rows.item(i).image;

                            $('#edit-item-name').val(name);
                            $('#edit-item-qty').val(quantity);
                            $('#select-native-15').val(uomString);
                            $('#edit-item-remark').val(remark);
                            $('#edit-item-image').attr("src",image);

                        }
                        
                        
                    }
               
                $.mobile.changePage('#edit-item-page', {transition: 'pop', role: 'dialog'});

                }

            },
            function(err){
                console.log('display item list error ' + err);
            });
    });



}