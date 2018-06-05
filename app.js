// jshint esversion:6
//"use strict";
class App {
    constructor() {
        this.tbl = null;
        this.mode = "paint";
        this.pickedColor =document.getElementById("colorPicker").value;
        this.rowcount = 10;
        this.colcount = 20;
        this.continuousMode = false;
        this.canvasArea = document.getElementById('pixelCanvas');
        }

    rgbToHex(color) {
    color = ""+ color;
    if (!color || color.indexOf("rgb") < 0) {
        return;
    }

    if (color.charAt(0) == "#") {
        return color;
    }

    let nums = /(.*?)rgb\((\d+),\s*(\d+),\s*(\d+)\)/i.exec(color),
        r = parseInt(nums[2], 10).toString(16),
        g = parseInt(nums[3], 10).toString(16),
        b = parseInt(nums[4], 10).toString(16);

    return "#"+ (
        (r.length == 1 ? "0"+ r : r) +
        (g.length == 1 ? "0"+ g : g) +
        (b.length == 1 ? "0"+ b : b)
    );
}
    makeGrid() {
        if (this.tbl)
            this.canvasArea.removeChild(this.tbl);

        this.tbl = document.createElement("table");
        for (let i = 0; i < this.rowcount; i++) {
            this.tbl.appendChild(this.getRow(this.colcount));
        }

        this.canvasArea.appendChild(this.tbl);
        this.mode="paint";
       
    }
    saveImage(elem,fileName,fnSave){
        return html2canvas(elem)
        .then( canvas => { fnSave(canvas.toDataURL(),fileName);});
      
    }
    downloadFile(data, filename) {
            let a = document.createElement('a'); 
            a.href = data;
            a.target = "_blank";
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
    }


    getRow(colcount) {
        let currentRow = document.createElement("tr");
        for (let i = 0; i < colcount; i++) {
            currentRow.appendChild(this.getCol());
        }
        return currentRow;
    }
    getCol() {
        let currentCol = document.createElement("td");
        currentCol.addEventListener("click", () => this.handler(currentCol));
        currentCol.addEventListener("mousedown", () => {this.continuousMode = true;  this.handler(currentCol);  });
        currentCol.addEventListener("mouseover", () => {
            if (this.continuousMode)
                this.handler(currentCol);
        });
        currentCol.addEventListener("mouseup", () => this.continuousMode = false);
       currentCol.style.background = "#ffffff";
        return currentCol;
    }

    handler(elem) {
        switch (this.mode) {
            case "paint":
                elem.style.background = this.pickedColor;
                break;
            case "redraw":
                document.querySelectorAll("td").forEach(el => el.style.background = "#ffffff");
                break;
            case "erase":
                elem.style.background = "#ffffff";

        }
    }

    setMode(type) {
        this.mode = type;
    }

    setPickedColor(color) {
        this.pickedColor = color;
    }

    init() {
        const drawBtn = document.getElementById("drawBtn");
        drawBtn.onclick = (elem, ev) => this.makeGrid();


        const colorPicker = document.getElementById("colorPicker");
        colorPicker.addEventListener("change", el => this.watchColorPicker(el), false);

        const eraseBtn = document.getElementById("clrBtn");
        eraseBtn.addEventListener("click", el => this.mode = "erase", false);
      


        const resetBtn = document.getElementById("resetBtn");
        resetBtn.addEventListener("click", el => {
            this.mode = "redraw";
            this.handler();
            this.mode="paint";
        }, false);

      
        document.body.addEventListener("mouseup", () => {
            this.continuousMode = false;
        });

        const captureBtn=document.getElementById("captureBtn");
        captureBtn.addEventListener("click",()=>{this.saveImage(this.tbl,"pixelArt.png",this.downloadFile);});

       
        const inputHeight = document.getElementById('inputHeight');
        const inputWidth = document.getElementById('inputWidth');

        inputHeight.addEventListener("change", () => this.rowcount = inputHeight.value);
        inputWidth.addEventListener("change", () => this.colcount = inputWidth.value);

        const saveBtn=document.getElementById("saveBtn");
        saveBtn.addEventListener("click",()=>this.saveSrc());
        this.pickedColor = document.getElementById("colorPicker").value;



               

        
        const invBtn=document.getElementById("compBtn");
        invBtn.addEventListener("click",()=>{this.complimentMe();});

        const rotateBtn=document.getElementById("rotateBtn");
        rotateBtn.addEventListener("click",()=>{this.transformOp("rotate");});

        const flipHorizBtn=document.getElementById("flipHorizBtn");
        flipHorizBtn.addEventListener("click",()=>{this.transformOp("horizontalFlip");});


        const flipVertBtn=document.getElementById("flipVertBtn");
        flipVertBtn.addEventListener("click",()=>{this.transformOp("verticalFlip");});


        const inpFile=document.getElementById("fileInput");
        inpFile.addEventListener('change',()=>{this.handleFile(inpFile);});
       


        this.makeGrid();


    }
   getCurrentState(){
       let arr=[];
       this.tbl.querySelectorAll("tr").forEach((row)=>{
           let arrcol=[];
            row.querySelectorAll("td").forEach(col => arrcol.push(col.style.background)); 
            arr.push(arrcol);
       });
       return arr;
   }
   linearTransformation(arr2d,fn){
       return arr2d.map(arr1d=> arr1d.map((col)=>fn(col)));
   }

   matrixTransformation(matrix, ...fns){
       let result=matrix;
       for(const f of fns) 
       result=f(result);
       return result;
   }

   compliment(colorval){
       //if(colorval===`rgb(255, 255, 255)`)       return;
  let colors=colorval.substring(4,colorval.length-1).split(",").map(n=>Number(n.trim())).map(n=>255-n);
  return `rgb(${colors.join(",")})`;
   }
   serializeColorVal(colorval){
    let colors=colorval.substring(4,colorval.length-1).split(",").map(n=>Number(n.trim()));
    let vals=colors[0]*256*256+colors[1]*256+colors[2];
    return `${vals.toString(16)}`;
     }
     deserializeColorVal(colorval){
        let colors=Number.parseInt(colorval,16);
        let b=colors&0xff;
        colors>>=8;
        let g=colors&0xff;
        let r=colors>>8;
        return `rgb(${r.toString(10)},${g.toString(10)},${b.toString(10)})`;
         }
   complimentMe(){
   this.redrawMe2(this.linearTransformation(this.getCurrentState(),this.compliment));

   }
   transformOp(op) {

       switch (op) {
           case "rotate":
               this.redrawMe2(this.matrixTransformation(this.getCurrentState(), this.Transpose, this.reverse));
               break;
           case "horizontalFlip":
                this.redrawMe2(this.matrixTransformation(this.getCurrentState(), this.reverse));
               break;
           case "verticalFlip":
               this.redrawMe2(this.matrixTransformation(this.getCurrentState(), this.reverse, this.Transpose, this.reverse, this.Transpose, this.reverse));
               break;
           case "symmetryTest":
               {
                   let curr = this.getCurrentState();
                   let hor = this.matrixTransformation(curr, this.reverse);
                   this.redrawMe2(this.And(curr, hor));
                   break;

               }
               case "transpose":
               this.redrawMe2(this.matrixTransformation(this.getCurrentState(), this.Transpose));
               break;
       }
   }
    And(matrix,matrix2) {
        let n = matrix.length;
        let m = matrix[0].length;
        let result = [],
            row=null;
        for (let i = 0; i < n; i++) {
            result.push([]);
            for (let j = 0; j < m; j++) {
                result[i][j]=this.deserializeColorVal(
                    ( Number.parseInt(this.serializeColorVal(matrix[i][j]),16)
                             & Number.parseInt(this.serializeColorVal(matrix2[i][j]),16)
                            ).toString(16));
            }
           // Transpose.push(row);
        }
        return result;
       // return this.reverse(Transpose);
    }


    Transpose(matrix) {
    let n = matrix.length;
    let m = matrix[0].length;
    let Transpose = [],
        row=null;
    for (let i = 0; i < n; i++) {
        Transpose.push([]);
        for (let j = 0; j < m; j++) {
            Transpose[i][j]=matrix[j][i];
        }
       // Transpose.push(row);
    }
    return Transpose;
   // return this.reverse(Transpose);
}
reverse(matrix){
    let n = matrix.length;
    let m = matrix[0].length;
    let reverse = [],
        row=null;
    for (let i = 0; i < n; i++) {
        reverse.push(matrix[i].reverse());
    }
    return reverse;
}

    handleFile(inpFile){
        if (!inpFile.files ||inpFile.files.length<1)
        return;
        let file = inpFile.files[0];
          let textType = /text.*/;
          if (file.type.match(textType)) {
            let reader = new FileReader();
             reader.addEventListener("load",()=>{
             let stContent = reader.result;
             this.redrawMe(stContent);
             inpFile.value='';
            });
          
            reader.readAsText(file);  
          } else {
            alert("File not supported!");
          }
    }
  redrawMe2(arrColors){
    this.rowcount=arrColors.length;
    this.colcount=arrColors[0].length;
    console.log(` the dimension of picture being loaded is ${this.rowcount}X${this.colcount}`);
    this.makeGrid();

 
     
     let rows=this.tbl.querySelectorAll("tr");
     let cols=null;
     for(let i=0;i<rows.length;i++){
        cols=rows[i].querySelectorAll("td");
        for(let j=0;j<cols.length;j++){
         cols[j].style.background = arrColors[i][j];
        }
      }

  }
    redrawMe(stContent) {
        let arrColors = [];
        let rows=stContent.split("\n");
        let cols=null;
        for(let i=0;i<rows.length;i++){
           arrColors.push(rows[i].split(","));
        }
       this.rowcount=arrColors.length;
       this.colcount=arrColors[0].length;
       console.log(` the dimension of picture being loaded is ${this.rowcount}X${this.colcount}`);
       this.makeGrid();

    
        
        rows=this.tbl.querySelectorAll("tr");
        for(let i=0;i<rows.length;i++){
           cols=rows[i].querySelectorAll("td");
           for(let j=0;j<cols.length;j++){
            cols[j].style.background = this.deserializeColorVal(arrColors[i][j]);
           if(this.serializeColorVal(cols[j].style.background)==="000004")
           console.log(` weird phenomenon at ${i} ${j} original was ${arrColors[i][j]}`);
           }
         }


       

    }
AnalyzeMe(defcolor="000004"){
    let rows=this.tbl.querySelectorAll("tr");
    let cols;
    for(let i=0;i<rows.length;i++){
       cols=rows[i].querySelectorAll("td");
       for(let j=0;j<cols.length;j++){
         if(this.serializeColorVal(cols[j].style.background)===defcolor)
       {console.log(` weird phenomenon at ${i} ${j}`);
       if(j>0)cols[j].style.background=cols[j-1].style.background;
       }   
    }
     }
}
    saveSrc(){
     let st="data:text/octet-stream,";
     let rows=this.tbl.getElementsByTagName("tr");
     let cols=null;
     for(let i=0;i<rows.length;i++){
       if(i>0) st+="\n";
       cols=rows[i].getElementsByTagName('td');
       for(let j=0;j<cols.length;j++){
        if(j>0) st+=",";
        st+=this.serializeColorVal(cols[j].style.background);
       }
     }
    
     this.downloadFile(st,"pixelArt.txt");
    }
    watchColorPicker(event) {
        this.mode = "paint";
        this.pickedColor = event.target.value;
    }
}
var app = app || new App();
app.init();

