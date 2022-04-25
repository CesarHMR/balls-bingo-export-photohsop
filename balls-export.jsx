(function CreateWindow(){

    var windowTitle = "Bingo Balls Export"
    var selectedFolder;
    var group;
    var panel;
    var window;
    var inputField;

    //Create Window
    window = new Window("dialog", windowTitle, undefined, { closeButton:true });
    window.alignChildren = "fill";

    //Folder Panel
    panel = window.add("panel");
    group = panel.add("group");
    var btnFolderOutput = group.add("button", undefined, "Folder...")
    var txtFolderOutput = group.add("statictext", undefined, "", { truncate: "middle" });
    txtFolderOutput.preferredSize = [200,-1];

    //Options Panel
    panel = window.add("panel", undefined, "Options");
    panel.alignChildren = "fill"
    group = panel.add("group");
    group.alignment = "left";
    group.add("statictext", undefined, "Balls amount per variant:")
    inputField = group.add ("edittext", undefined, "10");
    inputField.preferredSize = [35,-1];

    //Buttons
    group = window.add("group");
    group.alignment = "center";
    var btnOk = group.add("button", undefined, "Ok");
    var btnCancel = group.add("button", undefined, "Cancel");

    //Buttons interactivity
    btnFolderOutput.onClick = function(){
        selectedFolder = Folder.selectDialog();
        if(selectedFolder){
            txtFolderOutput.text = selectedFolder.fullName;
        }
    }
    btnOk.onClick = function(){
        if(!selectedFolder){
            alert("Select a folder to export the files!", windowTitle, true);
            return;
        }
        window.close(1);
    }
    btnCancel.onClick = function(){
        window.close(0);
    }

    //On closed window
    if(window.show() == 1){
        
        var ballAmount = parseInt(inputField.text);
        
        if(ballAmount > 10){
            ballAmount = 10;
        }

        if(ballAmount < 1){
            ballAmount = 1;
        }

        Execute(selectedFolder, ballAmount);
    }
})()

function Execute(selectedFolder, numberAmount){

    try{
        var doc = app.activeDocument;
        var ballsGroup = doc.layerSets.getByName('Balls');
        var titleElement = doc.layers.getByName('Text');
    }
    catch(e){
        if(!doc){
            alert("'Active document' not found!", "Set Up Error", true);
            return;
        }
        if(!ballsGroup){
            alert("'Balls folder' not found!", "Set Up Error", true);
            return;
        }
        if(!titleElement){
            alert("'Text Layer' not found!", "Set Up Error", true);
            return;
        }
    }

    Progress("Reading folder...");
    Progress.Set(numberAmount * ballsGroup.layers.length);

    //Set initial visibility
    ballsGroup.visible = true;
    titleElement.visible = true;

    for (i = 0; i < ballsGroup.layers.length; i++)
    {
        ballsGroup.layers[i].visible = false;
    }

    //Set layers to export
    var num = 0;

    for (var ball = 0; ball < ballsGroup.layers.length; ball++) {
        
        ballsGroup.layers[ball].visible = true;
        
        for (var number = 0; number < numberAmount; number++) {
            
            titleElement.textItem.contents = num;
            Progress.Message(selectedFolder + "/ball " + num);
            ExportPNG(selectedFolder.fullName, num);
            Progress.Increment();
            
            num++;
        }
        
        ballsGroup.layers[ball].visible = false;

    }

    Progress.Close();

    function Progress(initialMessage){
    
        var window = new Window("palette", "Exporting Files", undefined, { closeButton: false });
        var text = window.add("statictext", undefined, initialMessage);
        text.preferredSize = [450,-1];
        var bar = window.add("progressbar", undefined, "");
        bar.preferredSize = [450,-1];

        Progress.Close = function(){
            window.close();
        }
        Progress.Increment = function(){
            bar.value ++;
            window.update();
        }
        Progress.Message = function(message){
            text.text = message
        }
        Progress.Set = function(steps){
            bar.value = 0;
            bar.minvalue = 0;
            bar.maxvalue = steps;
            window.update();
        }
        window.show();
        window.update();
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