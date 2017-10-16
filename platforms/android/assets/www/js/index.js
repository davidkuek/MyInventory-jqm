$( document ).on( "mobileinit", function() {
 

pageOnLoad();





});


var item = {};
var db = null;
var dbName = 'itemDB';
var dbVersion = '1.0';
var dbDisplayName = 'Test DB';
var dbSize = 2*1024*1024;
var global_item_array;
var global_item_array_length = 0;




function pageOnLoad(){
fnDbInit();
empty('#item-list-view');   
resetAddItemForm();
displayItemList();  
$( document ).scroll(scrollEvent);
$('#item-add-done').click(validateForm);
$('#take-photo').click(openCamera);
$('#item-image').click(enlargePicture);
$('#edit-item-image').click(enlargePicture);
$('#choose-image').click(openFilePicker);
$('#refresh-button').click(refresh);
$('#edit-item-name,#edit-item-qty,#edit-select-native-15,#edit-item-remark').on('input',enableUpdate);
$('#edit-item-image').on('load', checkImageChange);
$("#update-item-button").click(updateList);
$("#delete-item-button").click(deleteList);

}

function loadingMessage(show,hide){
$.mobile.loading( show, {
  text: "Loading",
  textVisible: true,
  theme: "a",
  html: ""
});
}



function scrollEvent(){
var active = $.mobile.activePage[0].id;
var list_visible_length = $("#item-list-view li:visible").length;
  if (active == "main-page") {
    var windowHeight = $(window).height(); 
    var scrollHeight = $(window).scrollTop(); 
    var totalHeight = windowHeight; 
        
        if($(document).height() > $(window).height())
        {
            if($(window).scrollTop() == $(document).height() - $(window).height()){

                if (list_visible_length == global_item_array_length) {

                    return;
                }

                else{
                loadingMessage("show");

                loadItemList(list_visible_length,global_item_array);

                    setTimeout(function(){ 
                    loadingMessage("hide");
                    }, 2000);
                }
            }
        }
    }
}

function loadItemList(start_num,itemArray){
    
    var startnum = start_num; 
    var end_num = start_num + 10; 
    var arrayLength = itemArray.length; 

    
    if(arrayLength > end_num){
        for(var i=start_num; i < end_num; i++){
            append_item_list(   itemArray[i][0],
                                itemArray[i][1],
                                itemArray[i][2],
                                itemArray[i][3],
                                itemArray[i][4]
                                );
        }
    }else{
        for(var i=start_num; i < arrayLength; i++){
            append_item_list(   itemArray[i][0],
                                itemArray[i][1],
                                itemArray[i][2],
                                itemArray[i][3],
                                itemArray[i][4]
                                );
        }       
    }




}

function append_item_list(item0,item1,item2,item3,item4){
     $("#item-list-view").append("<li class=\"ui-li-has-thumb ui-first-child item-list-display\" onclick = \"loadItemDetails(" +
                            item0 + ")\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r item-list\"><img src=\"" + 
                            item1 + "\" style=\"margin:5px\"><h2>" + 
                            item2 + "</h2><p>" + 
                            item3 + " " +
                            item4 + "</p></a></li>");
                    
}



/* check image change provided edit image dialog is pop up and enable update button */
function checkImageChange(){
    if ($('#edit-item-page').closest('.ui-dialog').is(':visible')) {
        enableUpdate();
    }
}

/* function to clear content */
function empty(selector){

        $(selector).empty();
}

/* refresh page event */
function refresh(){
    location.reload(true);
    console.log('refresh');
}

/* enable update button */
function enableUpdate(){
    $('#update-item-button').removeClass('ui-state-disabled');
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






/* initialize database table */
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
            
            loadingMessage("show");
            setTimeout(function(){loadingMessage("hide")}, 2000);
            alert('Item saved!');
            console.log('item saved!');
            $('#add-item-page').dialog( "close" ); 
            pageOnLoad();
            copyFile(new_image);
            
        });

  },
  function(err){
    console.log(err);
  });   
  displayUom(); // display UOM result, prevent adding data repeatitively
}


/* add standard unit of measure */
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
            function(tx,results){
                if (results.rows.length > 0) {
                    
                    
                //     for (var i = 0 ; i < results.rows.length; i++) {
                    
                //     // var cont = 10;
                //     var item_id = results.rows.item(i).id;
                //         // item.length = result.rows.length;
                        
                //         $("#item-list-view").append("<li class=\"ui-li-has-thumb ui-first-child item-list-display\" onclick = \"loadItemDetails(" +
                //             item_id + ")\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r item-list\"><img src=\"" + 
                //             results.rows.item(i).image + "\" style=\"margin:5px\"><h2>" + 
                //             results.rows.item(i).name + "</h2><p>" + 
                //             results.rows.item(i).quantity + " " +
                //             results.rows.item(i).desc + "</p></a></li>");
                    
                // }

                // $("#main-page-content").append('<button class=\"ui-btn ui-shadow\" id=\"load-more-button\" onclick=\"loadMore()\">Load more</button>');
                    
                    var itemArray = [];
                    

                    for(var i=0; i < results.rows.length; i++){

                        var item_id = results.rows.item(i).id;
                        var item_image = results.rows.item(i).image;
                        var item_name = results.rows.item(i).name;
                        var item_qty = results.rows.item(i).quantity;
                        var item_desc = results.rows.item(i).desc;

                        itemArray[i] = [];
                        

                        itemArray[i][0] = item_id;
                        itemArray[i][1] = item_image;
                        itemArray[i][2] = item_name;
                        itemArray[i][3] = item_qty;
                        itemArray[i][4] = item_desc;

                        
                            
                    }
                    
                    window.global_item_array = itemArray;
                    window.global_item_array_length = itemArray.length;
                    loadItemList(0, itemArray);
            
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
        item.imageUri = imageUri;
        
    }, function cameraError(error) {
        console.log('camera '+error);

    }, options);

    $( "#take-photo-dialogue" ).dialog( "close" ); //closing dialog after choosing
}



function openFilePicker(selection) {

    var srcType = Camera.PictureSourceType.PHOTOLIBRARY;
    var options = setOptions(srcType);

    navigator.camera.getPicture(function cameraSuccess(imageUri) {

        displayImage(imageUri);

    }, function cameraError(error) {
        console.log('open image ' + error);

    }, options);

    $( "#take-photo-dialogue" ).dialog( "close" ); //closing dialog after choosing
}


//display image depends on which dialog image is appeared..
function displayImage(imageUri) {


    if ($('#add-item-page').closest('.ui-dialog').is(':visible')) {
        $('#item-image').attr('src',imageUri);
    }
    else if($('#edit-item-page').closest('.ui-dialog').is(':visible')) {
        $('#edit-item-image').attr('src',imageUri);
    }
    
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
$('#item-name').val("");
$('#item-qty').val("");
$('#item-remark').val("");
$('#item-image').attr('src',"");
}


/* load item details from list view to input form */
function loadItemDetails(item_id){

var query1 = "SELECT ITEM_LIST.NAME, ITEM_LIST.QUANTITY, ITEM_LIST.ID, ITEM_LIST.IMAGE, ITEM_LIST.REMARK, ITEM_LIST.UOM FROM ITEM_LIST ";
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
                            $('#edit-select-native-15').val(uomString);
                            $('#edit-item-remark').val(remark);
                            $('#edit-item-image').attr("src",image);

                            item.id = item_id;
                            item.imageCache = image;
                            
                        }
                        
                        
                    }
               
                $.mobile.changePage('#edit-item-page', {transition: 'pop', role: 'dialog'});
                
                }

            },
            function(err){
                console.log('load item list error ' + err);
            });
    });



}

/* update existing list item */
function updateList(){
    
    var new_name = $('#edit-item-name').val().toLowerCase();
    var new_quantity = $('#edit-item-qty').val();
    var new_uomString = $('#edit-select-native-15 :selected').val();
    var new_uomNumber = parseInt(new_uomString); //convert to number
    var new_remark = $('#edit-item-remark').val();
    var new_image = $('#edit-item-image').attr('src');
    var query1 = "UPDATE ITEM_LIST ";
    var query2 = "SET NAME = ?, QUANTITY = ?, UOM = ?, REMARK = ?, IMAGE = ?";
    var query3 = " WHERE ID = ?";

    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1 + query2 + query3,[new_name,new_quantity,new_uomNumber,new_remark,new_image,item.id],
            function(tx,result){
                    
                    if (item.imageCache !== new_image) {
                        deleteOldImageCache(item.imageCache);
                        deleteOldImageData(item.imageCache);
                        copyFile(new_image);
                        
                    }
                        
                    $('#edit-item-name').val(new_name);
                    $('#edit-item-qty').val(new_quantity);
                    $('#edit-select-native-15').val(new_uomString);
                    $('#edit-item-remark').val(new_remark);
                    $('#edit-item-image').attr("src",new_image);

                    
                    
                    $('#edit-item-page').dialog( "close" ); 
                    pageOnLoad();
                    alert("Item updated!");
                    console.log('item ' + item.id + ' updated.');


            },
            function(err){
                console.log('update item list error ' + err);
            });
    });
 }

/* delete list item */
function deleteList(){
    var query1 = "DELETE FROM ITEM_LIST ";
    var query2 = "WHERE ID = ?";
    var new_image = $('#edit-item-image').attr('src');

    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1 + query2,[item.id],
            function(tx,result){
                    
                    deleteOldImageCache(new_image);
                    deleteOldImageData(new_image);
                    $('#edit-item-page').dialog( "close" ); 
                    pageOnLoad();
                    alert('item deleted.');
                    console.log('item ' + item.id +  ' deleted.');

            },
            function(err){
                console.log('delete item list error ' + err);
            });
    });
}


/* delete image in cache file */
function deleteOldImageCache(imagePath){

var path = imagePath;
var fileName =  path.split("/").pop("cache"); //getting file name
var cachePath = cordova.file.externalCacheDirectory;

window.resolveLocalFileSystemURL(cachePath, function(dir) {
  dir.getFile(fileName, {create:false}, function(fileEntry) {
              fileEntry.remove(function(){
                console.log('cache file deleted');
                  
              },function(error){
                console.log('error of' + error.code);    
                  
              },function(){
                console.log('no file exist');
                 
              });
  });
});

}

/* delete image in data file (hidden) */
function deleteOldImageData(imagePath){

var path = imagePath;
var fileName =  path.split("/").pop("cache"); //getting file name
var standardPath = cordova.file.dataDirectory;

window.resolveLocalFileSystemURL(standardPath, function(dir) {
  dir.getFile(fileName, {create:false}, function(fileEntry) {
              fileEntry.remove(function(){
                console.log('data file deleted');
                  
              },function(error){
                console.log('error of' + error.code);    
                  
              },function(){
                console.log('no file exist');
                 
              });
  });
});

}



/* Move files after add files */
function copyFile(imagePath) {

    // var imagePath = item.imageUri;
    window.resolveLocalFileSystemURL(imagePath,function(fileEntry){
                newFileUri  = cordova.file.dataDirectory;
                oldFileUri  = imagePath;
                newFileName = imagePath.split("/").pop("cache");
                
                window.resolveLocalFileSystemURL(newFileUri,
                        function(dirEntry) {
                            // move the file to a new directory and rename it
                            fileEntry.copyTo(dirEntry, newFileName, successCallback, errorCallback);
                        },
                        errorCallback);
          },
          errorCallback);

  function successCallback(entry) {
    console.log("Copied Path: " + entry.fullPath);
  }

  function errorCallback(error) {
    console.log("Error:" + error.code);
  }   

}



function search_item_list(){


  var input, filter, ul, li;

    input = $('#search-input').val();
    filter = input.toLowerCase();
    // ul = $('#item-list-view');
    // li = $('#item-list-view li');

var query1 = "SELECT ITEM_LIST.ID, ITEM_LIST.IMAGE,ITEM_LIST.NAME, ITEM_LIST.quantity, UOM.DESC FROM ITEM_LIST ";
var query2 = "INNER JOIN UOM ON UOM.ID=ITEM_LIST.UOM";
    db = openDatabase(dbName, dbVersion, dbDisplayName, dbSize);
    db.transaction(function (tx){
        tx.executeSql(query1 + query2,[],
            function(tx,results){
                if (results.rows.length > 0) {

                    empty('#item-list-view');   

                    for (var i = 0 ; i < results.rows.length; i++) {
                        var item_name = results.rows.item(i).name;
                        var item_id = results.rows.item(i).id;
                        var item_image = results.rows.item(i).image;
                        var item_quantity = results.rows.item(i).quantity;
                        var item_desc = results.rows.item(i).desc;
                        

                        if (item_name.toLowerCase().indexOf(filter) > -1) {
                            $("#item-list-view").append("<li class=\"ui-li-has-thumb ui-first-child item-list-display\" onclick = \"loadItemDetails(" +
                            item_id + ")\"><a class=\"ui-btn ui-btn-icon-right ui-icon-carat-r item-list\"><img src=\"" + 
                            item_image + "\" style=\"margin:5px\"><h2>" + 
                            item_name + "</h2><p>" + 
                            item_quantity + " " +
                            item_desc + "</p></a></li>");  
                        }
   
                    }

            }

                
            },
            function(err){
                console.log('search item list error ' + err);
            });
    });



}

function reset_search(){
    var key = event.keyCode || event.charCode;

    if( key == 8 || key == 46 )
        pageOnLoad();
}