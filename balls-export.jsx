(function CreateWindow(){

    var windowTitle = "Bingo Balls Export"
    var selectedFolder
    var group
    var panel
    var window
    //var inputField

    //Create Window
    window = new Window("dialog", windowTitle, undefined, { closeButton:true })
    window.alignChildren = "fill"

    //Folder Panel
    panel = window.add("panel")
    group = panel.add("group")
    var btnFolderOutput = group.add("button", undefined, "Folder...")
    var txtFolderOutput = group.add("statictext", undefined, "", { truncate: "middle" })
    txtFolderOutput.preferredSize = [200,-1]

    //Options Panel
    panel = window.add("panel", undefined, "Options")
    panel.alignChildren = "fill"

    //Balls amount
    // group = panel.add("group")
    // group.alignment = "left"
    // group.add("statictext", undefined, "Balls amount per variant:")
    // inputField = group.add ("edittext", undefined, "10")
    // inputField.preferredSize = [35,-1]

    //Checkbox
    group = panel.add("group")
    group.alignment = "left"
    group.add("statictext", undefined, "Unique text for each group")
    var checkbox = group.add ("checkbox", undefined)

    //Buttons
    group = window.add("group")
    group.alignment = "center"
    var btnOk = group.add("button", undefined, "Ok")
    var btnCancel = group.add("button", undefined, "Cancel")

    //Buttons interactivity
    btnFolderOutput.onClick = function(){
        selectedFolder = Folder.selectDialog()
        if(selectedFolder){
            txtFolderOutput.text = selectedFolder.fullName
        }
    }
    btnOk.onClick = function(){
        if(!selectedFolder){
            alert("Select a folder to export the files!", windowTitle, true)
            return
        }
        window.close(1)
    }
    btnCancel.onClick = function(){
        window.close(0)
    }

    //On closed window
    if(window.show() == 1){
        Execute(selectedFolder, checkbox.value)
    }
})()

function Execute(selectedFolder, multipleTextsEnabled){
    if(app.documents.length == 0){
        alert("'Active document' not found!\nOpen a document to run the script.", "Balls Export Script", true)
        return
    }
    if(!app.activeDocument.saved){
        if(confirm("Save document?")){
            app.activeDocument.save()
        }
    }

    try{
        var ballsGroup = app.activeDocument.layerSets.getByName('Balls')
        var textsGroup = app.activeDocument.layerSets.getByName('Texts')
    }
    catch(e){
        if(!ballsGroup){
            alert("'Balls Group' not found!\nSet up the document correctly.", "Balls Export Script", true)
            return
        }
        if(!textsGroup){
            alert("'Text Group' not found!\nSet up the document correctly.", "Balls Export Script", true)
            return
        }
    }

    if(ballsGroup.layers.length == 0){
        alert("'Balls Group' is empty!\nSet up the document correctly.", "Balls Export Script", true)
        return
    }
    if(textsGroup.layers.length == 0){
        alert("'Texts Group' is empty!\nSet up the document correctly.", "Balls Export Script", true)
        return
    }
    if(multipleTextsEnabled && textsGroup.layers.length != ballsGroup.layers.length){
        alert("The amount of elements in 'Balls Group' must be the same as the amount in the 'Texts Group'!\nSet up the document correctly.", "Balls Export Script", true)
        return
    }
    
    var executeData = {selectedFolder: selectedFolder, ballsGroup: ballsGroup, textsGroup: textsGroup}

    Progress("Reading folder...")
    Progress.Set(10 * ballsGroup.layers.length)

    multipleTextsEnabled ? ExecuteMultipleTexts(executeData) : ExecuteSingleText(executeData)

    Progress.Close()

    alert("Done!", "Balls Export Script")
}

function ExecuteSingleText(executeData){

    var selectedFolder = executeData.selectedFolder
    var ballsGroup = executeData.ballsGroup
    var textsGroup = executeData.textsGroup
    
    //Set layers visibility
    ballsGroup.visible = true
    textsGroup.visible = true
    textsGroup.layers[0].visible = true
    
    for (i = 0; i < ballsGroup.layers.length; i++)
    {
        ballsGroup.layers[i].visible = false
    }
    
    //Set layers to export
    var ballNumber = 0
    
    for (var i = 0; i < ballsGroup.layers.length; i++) {
        
        ballsGroup.layers[i].visible = true
        
        for (var j = 0; j < 10; j++) {
            
            textsGroup.layers[0].textItem.contents = ballNumber
            var ballName = "ball_" + (ballNumber < 10 ? "0" : "") + ballNumber //ball_01.png
            ExportPNG(selectedFolder.fullName, ballName)
            Progress.Message(selectedFolder + "/" + ballName)
            Progress.Increment()
            
            ballNumber++
        }
        
        ballsGroup.layers[i].visible = false
    }
}

function ExecuteMultipleTexts(executeData){
    
    var selectedFolder = executeData.selectedFolder
    var ballsGroup = executeData.ballsGroup
    var textsGroup = executeData.textsGroup
    
    //Set layers visibility
    ballsGroup.visible = true
    textsGroup.visible = true

    for (i = 0; i < ballsGroup.layers.length; i++)
    {
        ballsGroup.layers[i].visible = false
        textsGroup.layers[i].visible = false
    }

    //Set layers to export
    var ballNumber = 0

    for (var i = 0; i < ballsGroup.layers.length; i++) {
        
        ballsGroup.layers[i].visible = true
        textsGroup.layers[i].visible = true
        
        for (var j = 0; j < 10; j++) {
            
            textsGroup.layers[i].textItem.contents = ballNumber
            var ballName = "ball_" + (ballNumber < 10 ? "0" : "") + ballNumber //ball_01.png
            ExportPNG(selectedFolder.fullName, ballName)
            Progress.Message(selectedFolder + "/" + ballName)
            Progress.Increment()
            
            ballNumber++
        }
        
        ballsGroup.layers[i].visible = false
        textsGroup.layers[i].visible = false
    }
}

function ExportPNG(selectedFolder, fileName)
{
    saveFile = File(selectedFolder + "/" + fileName + ".png")

    var pngOpts = new ExportOptionsSaveForWeb

    pngOpts.format = SaveDocumentType.PNG  
    pngOpts.PNG8 = false
    pngOpts.transparency = true    
    pngOpts.interlaced = false
    pngOpts.quality = 100
    
    activeDocument.exportDocument(new File(saveFile),ExportType.SAVEFORWEB,pngOpts)
}

function Progress(initialMessage){
    
    var window = new Window("palette", "Exporting Files", undefined, { closeButton: false })
    var text = window.add("statictext", undefined, initialMessage)
    text.preferredSize = [450,-1]
    var bar = window.add("progressbar", undefined, "")
    bar.preferredSize = [450,-1]

    Progress.Close = function(){
        window.close()
    }
    Progress.Increment = function(){
        bar.value ++
        window.update()
    }
    Progress.Message = function(message){
        text.text = message
    }
    Progress.Set = function(steps){
        bar.value = 0
        bar.minvalue = 0
        bar.maxvalue = steps
        window.update()
    }
    window.show()
    window.update()
}
