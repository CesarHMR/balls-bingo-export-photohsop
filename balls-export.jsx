(function CreateWindow(){

    var group;
    var panel;
    var window;
    var selectedFolder;

    window = new Window("dialog", "Balls Export");
    panel = window.add("panel");
    group = panel.add("group");
    var btnFolderOutput = group.add("button", undefined, "Folder...")
    var txtFolderOutput = group.add("statictext", undefined, "", { truncate: "middle" });
    txtFolderOutput.preferredSize = [200,-1];
    group = window.add("group");
    group.alignChildren = "center";
    var btnOk = group.add("button", undefined, "Ok");
    var btnCancel = group.add("button", undefined, "Cancel");

    btnFolderOutput.onClick = function(){
        selectedFolder = Folder.selectDialog();
        if(selectedFolder){
            txtFolderOutput.text = selectedFolder.fullName;
        }
    }
    btnOk.onClick = function(){
        window.close(1);
    }
    btnCancel.onClick = function(){
        window.close(0);
    }

    if(window.show() == 1){
        if(selectedFolder){
            Process(selectedFolder);
        }
        else{
            alert("Select a folder to export the files!")
        }
    }

})()

function Process(selectedFolder){

    var doc = app.activeDocument;
    var ballsGroup = doc.layerSets.getByName('Balls');
    var titleElement = doc.layers.getByName('Text');
    
    //Set up
    ballsGroup.visible = true;
    titleElement.visible = true;
    for (i = 0; i < ballsGroup.layers.length; i++)
    {
        ballsGroup.layers[i].visible = false;
    }

    //Set layers to export
    var num = 1;

    for (var ball = 0; ball < ballsGroup.layers.length; ball++) {
        
        ballsGroup.layers[ball].visible = true;
        
        for (var number = 0; number < 2; number++) {

            titleElement.textItem.contents = num;
            ExportPNG(selectedFolder.fullName, "ball-" + num);
            num++;
        }
        
        ballsGroup.layers[ball].visible = false;

    }
}

function ExportPNG(selectedFolder, fileName)
{
    // Confirm the document has already been saved and so has a path to use
    try 
    {
        app.activeDocument.save()
    } catch(e) {
        alert("Could not export PNG as the document is not saved.\nPlease save and try again.")
        return
    }
    
    saveFile = File(selectedFolder + "/" + fileName + ".png");

    var pngOpts = new ExportOptionsSaveForWeb;

    pngOpts.format = SaveDocumentType.PNG  
    pngOpts.PNG8 = false;
    pngOpts.transparency = true;    
    pngOpts.interlaced = false;
    pngOpts.quality = 100;
    
    activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,pngOpts);
}