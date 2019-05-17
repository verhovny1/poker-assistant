// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
 //Обявлення констант
const electron = require("electron")
const { ipcRenderer, remote } = require('electron');
	const desktopCapturer = electron.desktopCapturer;
	const electronScreen = electron.screen; 
	const shell = electron.shell;
const fs = require('fs')
const os = require('os')
const path = require('path')

const brain = require('brain.js');
const functions = require('./functions.js');


	let isWork = false;
	let percentageIncreaseSize = 1;
	let logText = "";
 
let theWindows = [];
let selWindow = 0;


function handleStream (stream) {
	const video = document.getElementById('video');// document.querySelector('video')
	video.srcObject = stream;
	video.onloadedmetadata = (e) => video.play();
}
function handleError (e) {
	console.log(e)
}
function getVideo()
{
	let thumbSize = determinaScreenShot( );
    //let thumbSize = { width: theWindows[selWindow].width , height: theWindows[selWindow].width } ;
    let option =  {types: ['window', 'screen'], thumbnailSize: thumbSize};

    desktopCapturer.getSources( option , (error, sources) => {
		if (error) throw error
		for (let i = 0; i < sources.length; ++i) 
		{
			if (sources[i].name === theWindows[selWindow].name) 
			{
				//get siz
				let siz = sources[i].thumbnail.getSize();
				theWindows[selWindow].width = siz.width;
				theWindows[selWindow].height = siz.height;

			  	navigator.mediaDevices.getUserMedia({
			    audio: false,
			    video: {
					mandatory: {
						chromeMediaSource: 'desktop',
						chromeMediaSourceId: sources[i].id /*,
						minWidth: siz.width,
						maxWidth: siz.width,
						minHeight: siz.height,
						maxHeight: siz.height */
					}
			    }
			  	}).then((stream) => handleStream(stream))
			    .catch((e) => handleError(e))
			  return
			}
		}
    }) 
  
}

function getWindows()
{
 	//let thumbSize = determinaScreenShot( );
    let option =  {types: ['window', 'screen'] }; //,thumbnailSize:thumbSize };

	desktopCapturer.getSources( option, (error, sources) => {
    
    if (error) throw error;
    theWindows = [];

    let text = "";
    for (let i = 0; i < sources.length; ++i)  
    {
    	//let siz = sources[i].thumbnail.getSize();

    	let wind = {};
    	wind.id = sources[i].id;
    	wind.name = sources[i].name;
    	wind.width = 1366; //siz.width;
    	wind.height = 768; //siz.height;
    	theWindows[i]= wind;

      	text += "<option value='"+i+"' >"+sources[i].name+"</option>";
   
    }

    let windowsSelect = document.getElementById('windowsSelect');
	windowsSelect.innerHTML = text;
	
	getVideo();
    
  });
}
getWindows();




function getScreen()
{
	const video = document.getElementById('video');
	const canvas = document.getElementById('canvas');

	canvas.width = theWindows[selWindow].width;
    canvas.height = theWindows[selWindow].height;
    canvas.style.width = theWindows[selWindow].width;
    canvas.height.width = theWindows[selWindow].height;

    let context = canvas.getContext('2d');

    //context.fillRect(0, 0, theWindows[selWindow].width, theWindows[selWindow].height);
    context.drawImage(video, 0, 0, theWindows[selWindow].width , theWindows[selWindow].height);

	let imageData = context.getImageData(0, 0, theWindows[selWindow].width, theWindows[selWindow].height);
    let bitmap = imageData.data;

	return bitmap; 
}

//////////////////////////////////////////Події кнопок//////////////////////////////////////////
//Кнопка налаштувань програми
const settingsApp = document.getElementById('settingsAppBtn');
settingsApp.addEventListener('click', function(event)
{
	let bitmap = getScreen();
	//bitmap = functions.binarize( bitmap , 2 );
		//відкриваємо вікно налаштувань
    ipcRenderer.send('modalWindow', 'show');
    //ipcRenderer.send('modalWindow', { bitmap:newbitmap, width : imageWeight, height: imageHeight} );
    arg = {}
    arg.bitmap = bitmap;
    arg.width = theWindows[selWindow].width;
    arg.height = theWindows[selWindow].height;
    ipcRenderer.send('modalWindowSendBitmap', arg );    


});


//Зміна селекту
const windowsSelect = document.getElementById('windowsSelect');
windowsSelect.addEventListener('change', function(event)
{
	selWindow = windowsSelect.options[windowsSelect.selectedIndex].value;
	getVideo();
});

//кнопка оновлення списку вікон
const updateWindows = document.getElementById('updateWindows');
updateWindows.addEventListener('click', function(event)
{
	getWindows();
});


//запуск рооти програми
const startAppWork = document.getElementById('startAppWorkBtn');
startAppWork.addEventListener('click', function(event)
{
	mainRecognition();

	//isWork = true;
	//timerApp();
});

 
const stopAppWor = document.getElementById('stopAppWorkBtn');
stopAppWor.addEventListener('click', function(event)
{
	getScreen();
	isWork = false;
});

 
const exitApp = document.getElementById('exitAppBtn');
exitApp.addEventListener('click', function(event)
{
	/*const remote = require('electron').remote;
	let w = remote.getCurrentWindow();
	w.close(); */
	ipcRenderer.send('mainWindow', 'exit');	
});


//Таймер для скріншотів
function timerApp() 
{
	if ( isWork == true )
	{
		mainRecognition();
	} 
}
//покищо не запускатимем таймер
/*setInterval(function() {  
	timerApp();
}, 1000);*/

////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Функці допоміжні//////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////////////
function determinaScreenShot( size = 1)
{
	const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  	const maxDimasion = Math.max(screenSize.width, screenSize.height);
  	const minDimasion = Math.min(screenSize.width, screenSize.height);
  	return{
    	width: maxDimasion * window.devicePixelRatio*size,
    	height: maxDimasion * window.devicePixelRatio*size,
  	};
};
function sizeScreenShot( size = 1)
{
	const screenSize = electronScreen.getPrimaryDisplay().workAreaSize;
  	return{
    	width: screenSize.width*size,
    	height: screenSize.height*size,
  	};
};

function readConfig()
{
	const config = require('./config.js');
	odjectsData = config.getConfig();

	return odjectsData;
}

function getNetwork( netName )
{
	const config = require('./config.js');
	odjectsData = config.getNet( netName );

	return odjectsData;
}

function getTime()
{
	let today = new Date();

	return time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds() + ":" + today.getMilliseconds();
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////Функці обробки та розпізнавання//////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

//на вході масив пікселів зображення
//на виході масив розпізнаних обєктів
function mainRecognition( )
{
	//одержуємо данні обєктів
	let odjectsData = readConfig(); 
	let playersCount = odjectsData['playersCount']; //кількість гравців


	let SimbolsNet = getNetwork("simbolsNet");
	let outputArr = ["A","K","Q","J","0","1","2","3","4","5","6","7","8","9","Daisy","Cross","Hearts","Peak","_"];
	let NumsNet = getNetwork("numsNet");
	let outputArrNums = ["$","0","1","2","3","4","5","6","7","8","9",",","."];
	//створюємо екземпляр мережі
    var net = new brain.NeuralNetwork();
	net.fromJSON(  SimbolsNet);  
	var netNums = new brain.NeuralNetwork();
	netNums.fromJSON(  NumsNet); 
  
  	//отримуємо розміри та 
	let siz = {width: theWindows[selWindow].width, height: theWindows[selWindow].height}

logText = "";
logText += "Start = " + getTime() + "\n";


	//бітмап зображення
	let bitmap = getScreen(); //.slice(0, siz.width * siz.height * 4);	
	logText += "get bitmap = " + getTime() + "\n";
			
	//перетворюємо bitmap в 2Д масив
	let data = functions.getRGB2dArr( bitmap, siz.width, siz.height);
	logText += "convert to 2D arr = " + getTime() + "\n";
	//functions.setArrToCanvas( data , "canvas1");	
 	


logText += "start recognition = " + getTime() + "\n"; 	      		    		 
  	
	//вирізать з зображення обєкти
	for (var i = 1; i <= playersCount + 3; i++)  //playersCount*2+1
	{
		let area = odjectsData['Area'+i.toString() ];
		
 		if ( area.type == "cardsOnTable"  || area.type == "CardsOfPlayer1" )
 		{
 			logText += "Area "+i.toString() +  "("+area.type+"): " + getTime() + "\n";

			let dataArr = functions.slice2dArr( data, area ); 
			logText += "get areas from img = " + getTime() + "\n";
 			//functions.setArrToCanvas( dataArr , "canvas2");
	 
			dataArr = functions.blurryColorImg(dataArr,  1, "averaging-to-new" );
			logText += "get blurry = " + getTime() + "\n";
			//functions.setArrToCanvas( dataArr , "canvas3");

			dataArr = functions.binarize( dataArr , 4, 2, 140 );
			logText += "binarize  = " + getTime() + "\n";
	 		//functions.setArrToCanvas( dataArr , "canvas4");

	 		let findObjects = [];
			findObjects = functions.segmentationArrayPixelscan( dataArr );
			logText += "segmentation  = " + getTime() + "\n";
			//console.log(findObjects);

			/*let findOb = functions.segmentationScaner2( dataArr,  "black");
			logText += "segmentationScaner  = " + getTime() + "\n";
			console.log(findOb);*/


	 		findObjects = removeUnnecessaryObjects( findObjects, area.right-area.left, area.bottom-area.top );
	 		//console.log(findObjects);

	 		let recognSimv = []; let recCount = 0;	
			for (var n = 0; n < findObjects.length; n++) 
			{
				let dataArr16x16 = functions.resampleSingleArr(findObjects[n].data2dAr, 16, 16);
				//functions.setArrToCanvas( dataArr16x16 , "canvas"+ (5+n).toString() );
				//logText += "resample  obj" + n.toString() + ": " + getTime() + "\n";

				let bin16x16 = functions.binarizeArray(dataArr16x16,127);
				//logText += "binarizeArray  obj" + n.toString() + ": " + getTime() + "\n";

				var bin256 = functions.C2Dto1D(bin16x16);
				//logText += "C2Dto1D  obj" + n.toString() + ": " + getTime() + "\n";
				//console.log(bin256);
	 
				var output = net.run( bin256 );
				//console.log(output);

	 			//отримуємо масив розпізнаних символів	 recognSimv
	            var max = parseFloat( output[0] ) ; var maxPos = 0;
	            for (var m = 0; m < outputArr.length ; m++) //for (var m = 0; m < output.length ; m++) - не работает с-чка
	            {
	                if ( max < parseFloat(output[m]) )
	                {
	                    max = parseFloat(output[m]);
	                    maxPos = m;
	                }
	            }
	            if (max > 0.8) 
	            {
	        		let ob = {};
	        		ob.simv = outputArr[maxPos];
	        		ob.prob = max.toString();
	        		ob.top = findObjects[n].top;
	        		ob.left = findObjects[n].left;
	        		ob.right = findObjects[n].right;
	        		ob.bottom = findObjects[n].bottom;
	        		ob.isEnable = true;
	        		recognSimv[recCount] = ob;
	        		recCount++;
				}

			}
			//console.log(recognSimv);

			//отримуємо масив знайдених карт
			let cards = recCards(recognSimv);
			console.log(cards);
 
			logText += "find cards:  [" + cards.toString() + "] : " + getTime() + "\n";
		} 
		else if ( area.type == "PotOnTable" )
		{
			logText += "Area "+i.toString() + "("+area.type+"): " + getTime() + "\n";

			let dataArr = functions.slice2dArr( data, area ); 
			logText += "get areas from img = " + getTime() + "\n";
 			//functions.setArrToCanvas( dataArr , "canvas2");
	 
 			let dataArrX2 = functions.resampleSingleArr( dataArr, (area.right - area.left) * 2 , (area.bottom - area.top) * 2);
 			logText += "resample areas X2 = " + getTime() + "\n";
 			//functions.setArrToCanvas( dataArrX2 , "canvas3"); 

			dataArr = functions.binarize( dataArrX2 , 4, 2, 200 );
			logText += "binarize  = " + getTime() + "\n";
	 		//functions.setArrToCanvas( dataArr , "canvas4");
 
	 		let findObjects = [];
			findObjects = functions.segmentationArrayPixelscanWite( dataArr );
			//logText += "segmentation  = " + getTime() + "\n";
			//console.log(findObjects);
 
			let recognSimv = []; let recCount = 0;	
			for (var n = 0; n < findObjects.length; n++) 
			{
				let dataArr16x16 = functions.resampleSingleArr(findObjects[n].data2dAr, 16, 16);
				functions.setArrToCanvas( dataArr16x16 , "canvas"+ (5+n).toString() );
				//logText += "resample  obj" + n.toString() + ": " + getTime() + "\n";

				let bin16x16 = functions.binarizeArray(dataArr16x16,127);
				//logText += "binarizeArray  obj" + n.toString() + ": " + getTime() + "\n";

				var bin256 = functions.C2Dto1D(bin16x16);
				//logText += "C2Dto1D  obj" + n.toString() + ": " + getTime() + "\n";
				//console.log(bin256);
	 
				var output = netNums.run( bin256 );
				//console.log(output);

	 			//отримуємо масив розпізнаних символів	 recognSimv
	            var max = parseFloat( output[0] ) ; var maxPos = 0;
	            for (var m = 0; m < outputArrNums.length ; m++) //for (var m = 0; m < output.length ; m++) - не работает с-чка
	            {
	                if ( max < parseFloat(output[m]) )
	                {
	                    max = parseFloat(output[m]);
	                    maxPos = m;
	                }
	            }
	            if (max > 0.1) 
	            {
	        		let ob = {};
	        		ob.simv = outputArrNums[maxPos];
	        		ob.prob = max.toString();
	        		ob.top = findObjects[n].top;
	        		ob.left = findObjects[n].left;
	        		ob.right = findObjects[n].right;
	        		ob.bottom = findObjects[n].bottom;
	        		ob.isEnable = true;
	        		recognSimv[recCount] = ob;
	        		recCount++;
				}
			 

			}
	 		//console.log(recognSimv);

	 		let thePot = getPot(recognSimv);
	 		console.log(thePot);

	 		logText += "find Pot:  [" + thePot.toString() + "] : " + getTime() + "\n";
		}

		else if (area.type == "AreaOfPlayer1") //( area.type.indexOf("AreaOfPlayer") != -1 )
		{
			logText += "Area "+i.toString() + "("+area.type+"): " + getTime() + "\n";

			let dataArr = functions.slice2dArr( data, area ); 
			logText += "get areas from img = " + getTime() + "\n";
 			functions.setArrToCanvas( dataArr , "canvas2");
	 		//console.log(dataArr);

	 		let colorFound = colorsFound(dataArr);
	 		console.log(colorFound);

 			let dataArrX2 = functions.resampleSingleArr( dataArr, (area.right - area.left) * 2 , (area.bottom - area.top) * 2);
 			logText += "resample areas X2 = " + getTime() + "\n";
 			functions.setArrToCanvas( dataArrX2 , "canvas3"); 

			dataArr = functions.binarize( dataArrX2 , 4, 2, 180 );
			logText += "binarize  = " + getTime() + "\n";
	 		functions.setArrToCanvas( dataArr , "canvas4");
 
	 		let findObjects = [];
			findObjects = functions.segmentationArrayPixelscanWite( dataArr );
			logText += "segmentation  = " + getTime() + "\n";
			//console.log(findObjects);
 
 			if ( colorFound.color == "noine ")
 			{

 			}else 
 			{
 				findObjects = getTopAndBottomLine(findObjects, "bottom" );

 				let recognSimv = []; let recCount = 0;	
				for (var n = 0; n < findObjects.length; n++) 
				{
					let dataArr16x16 = functions.resampleSingleArr(findObjects[n].data2dAr, 16, 16);
					functions.setArrToCanvas( dataArr16x16 , "canvas"+ (5+n).toString() );
					//logText += "resample  obj" + n.toString() + ": " + getTime() + "\n";

					let bin16x16 = functions.binarizeArray(dataArr16x16,127);
					//logText += "binarizeArray  obj" + n.toString() + ": " + getTime() + "\n";

					var bin256 = functions.C2Dto1D(bin16x16);
					//logText += "C2Dto1D  obj" + n.toString() + ": " + getTime() + "\n";
					//console.log(bin256);
		 
					var output = netNums.run( bin256 );
					//console.log(output);

		 			//отримуємо масив розпізнаних символів	 recognSimv
		            var max = parseFloat( output[0] ) ; var maxPos = 0;
		            for (var m = 0; m < outputArrNums.length ; m++) //for (var m = 0; m < output.length ; m++) - не работает с-чка
		            {
		                if ( max < parseFloat(output[m]) )
		                {
		                    max = parseFloat(output[m]);
		                    maxPos = m;
		                }
		            }
		            if (max > 0.1) 
		            {
		        		let ob = {};
		        		ob.simv = outputArrNums[maxPos];
		        		ob.prob = max.toString();
		        		ob.top = findObjects[n].top;
		        		ob.left = findObjects[n].left;
		        		ob.right = findObjects[n].right;
		        		ob.bottom = findObjects[n].bottom;
		        		ob.isEnable = true;
		        		recognSimv[recCount] = ob;
		        		recCount++;
					}
				 

				}
 			}

			 


		}







	}





	//Розпаралеленя 
		//обробка зображенння
		//сегментація
		//налаштування нейронної мережі та розпізнавання обєктів
		//формування вихідного результату
	//повернення або друк масиву знайдених обєктів

logText += "End recognitio = " + getTime() + "\n";


 
logText += "End process " + getTime() + "\n";
$('#outDataTextera').val( logText);
 
}

 
///////////////////////////////////////////////////////Карти/////
function removeUnnecessaryObjects( findObjects, H , W )
{
	let retArr = [];

	//прибираємо завеликi елементи
	for (var i = 0; i < findObjects.length; i++) 
	{
 		
 		let top = findObjects[i].top;
		let left = findObjects[i].left;
		let right = findObjects[i].right;
		let bottom = findObjects[i]. bottom;
		let width = right - left;
		let height = bottom - top;

		if ( width < W*0.5 && height < H*0.5 ) retArr[retArr.length] = findObjects[i];
	}
	//return retArr;

 	//Розподіляємо обэкти по рядам
		//Знаходимо верхній обєкт і переміщаємо його в перед масиву. Створюємо масив значень (в рядку)
		let inLineArr = [];
		for (var i = 0; i < retArr.length; i++) 
		{
			if ( retArr[0].top > retArr[i].top)
			{
				let buf = retArr[i].top;
				retArr[i].top = retArr[0].top;
				retArr[0].top  = buf;
			}
	 		
			inLineArr[i] = false;
	 	}

 	let newArr = [];	
 	for (var i = 0; i < retArr.length; i++) 
 	{
 		//якщо обєкт не знаходиться в рядку
 		if ( inLineArr[i] == false )
 		{
 			let newLine = [];
 				newLine[newLine.length] = retArr[i];
 			inLineArr[i] = true;

 			let height =  retArr[i].bottom - retArr[i].top;
 			let mediane = retArr[i].top+height/2;

 			
 			for (var n = 0; n < retArr.length; n++) 
 			{
 				let thisTop = retArr[n].top;
 				let thisBottom = retArr[n].bottom;
 				let thisHeight = thisBottom - thisTop;

 				if( i != n && height*0.5 <  thisHeight && thisTop < mediane &&  thisBottom >  mediane )
 				{
 					newLine[newLine.length] = retArr[n];
 					inLineArr[n] = true;
 				}

 			}
 			newArr[newArr.length] = newLine;
 		}	 
 	}
 	//console.log(newArr);
 

 	//беремо верхній і нижній ряд із 3-х рядів
 	let newRetArr = [];
 	if ( newArr.length > 0 )
 	{
 		for (var i = 0; i < newArr[0].length; i++)  newRetArr[newRetArr.length] = newArr[0][i];
 		for (var i = 0; i < newArr[newArr.length-1].length; i++)  newRetArr[newRetArr.length] = newArr[newArr.length-1][i];
 	}

 	return newRetArr;

 	
}


function recCards( recognSimv )
{
	let retCards = [];

	for (var i = 0; i < recognSimv.length; i++)  if ( recognSimv[i].isEnable == true)
	{
		recognSimv[i].isEnable = false;

		if ( inArr(recognSimv[i].simv, ["A","K","Q","J","0","3","4","5","6","7","8","9"] )   )
		{		
			let min = 100000;
			let minPos = null;

			//шукаємо найближчу масть
			for (var n = 0; n < recognSimv.length; n++)
				if (i != n && inArr(recognSimv[n].simv, ["Daisy","Cross","Hearts","Peak"] ) && min > Math.abs(recognSimv[i].left - recognSimv[n].left)  )
				{
					min = Math.abs( recognSimv[i].left - recognSimv[n].left);
					minPos = n;
				}

			if ( minPos != null)
			{
				recognSimv[minPos].isEnable = false;
				retCards[retCards.length] = recognSimv[i].simv + ":" + recognSimv[minPos].simv;
			} else retCards[retCards.length] = recognSimv[i].simv + ":";
		}
		else if ( inArr(recognSimv[i].simv, ["1","0"] ) == true )
		{
			//шукаємо спарений символ
			let min = 10000;
			let minPos = null;
			if ( recognSimv[i].simv == "0")
			{
				for (var n = 0; n < recognSimv.length; n++)
				if (i != n &&  recognSimv[n].simv == "1"  && min > Math.abs( recognSimv[i].left - recognSimv[n].left)  )
				{
					min = Math.abs( recognSimv[i].left - recognSimv[n].left);
					minPos = n;
				}
			} else if ( recognSimv[i].simv == "1")
			{
				for (var n = 0; n < recognSimv.length; n++)
				if (i != n &&  recognSimv[n].simv == "0"   && min > Math.abs( recognSimv[i].left - recognSimv[n].left)  )
				{
					min = Math.abs( recognSimv[i].left - recognSimv[n].left);
					minPos = n;
				}
			} 
			if ( minPos != null ) recognSimv[minPos].isEnable = false;
			recognSimv[i].simv = "10";
		
			//шукаємо найближчу масть
			min = 10000;
			minPos = null;
			for (var n = 0; n < recognSimv.length; n++)
				if (i != n && inArr(recognSimv[n].simv, ["Daisy","Cross","Hearts","Peak"] ) && min > Math.abs( recognSimv[i].left - recognSimv[n].left)  )
				{
					min = Math.abs( recognSimv[i].left - recognSimv[n].left);
					minPos = n;
				}

			if ( minPos != null)
			{
				recognSimv[minPos].isEnable = false;
				retCards[retCards.length] = recognSimv[i].simv + ":" + recognSimv[minPos].simv;
			} else retCards[retCards.length] = recognSimv[i].simv + ":";
		}

	}
	
	return retCards;
}

 function inArr( val, arr)
 {
 	for (var i = 0; i < arr.length; i++) 
 		if (arr[i] == val) return true;

 	return false; 
 }

///////////////////////////////////////////////////////Цифри/////
function getPot(recognSimv)
{
	let retArr = [];

	let dolPos = null;

	//сортуємо масив від меньшого до більшого по left
	for (var i = 0; i < recognSimv.length; i++) {
		
		let min = recognSimv[i].left; minPos = i;
		for (var n = i+1; n < recognSimv.length; n++) 
		if ( recognSimv[n].left < min )
		{
			min = recognSimv[n].left;
			minPos = n;
		}

		let buf = recognSimv[i];
		recognSimv[i] = recognSimv[minPos];
		recognSimv[minPos] = buf;
		
		//Заходимо символ $
		if ( recognSimv[i].simv == "$") dolPos = i;
	}

	
	//сортуємо всі що знах. за $
	if ( dolPos != null)
	{
		recognSimv = recognSimv.slice( dolPos, recognSimv.length);
	}


	for (var i = 0; i < recognSimv.length; i++) retArr[i] = recognSimv[i].simv;

	return retArr
}


///////////////////////////////////////////////////////AreaOfPlayer/////
function rgbToHex(r, g, b) 
{
    if (r > 255 || g > 255 || b > 255)
        throw "Invalid color component";
    return ((r << 16) | (g << 8) | b).toString(16);
}

function colorsFound(rgbaArr)
{
	let H = rgbaArr.length;
	let W = rgbaArr[0].length;

	for (var i = 0; i < H; i++) {
		for (var n = 0; n < W; n++) 
		{
			if ( rgbaArr[i][n].R > 150 && rgbaArr[i][n].R < 255 && rgbaArr[i][n].G > 0 && rgbaArr[i][n].G < 10 && rgbaArr[i][n].B > 20 && rgbaArr[i][n].B < 30 )
			{
				var hex = "#" + ("000000" + rgbToHex( rgbaArr[i][n].R , rgbaArr[i][n].G , rgbaArr[i][n].B )).slice(-6);
				return {  color: "red", hex: hex };
			}
			else if ( rgbaArr[i][n].R > 20 && rgbaArr[i][n].R < 40 && rgbaArr[i][n].G > 100 && rgbaArr[i][n].G < 200 && rgbaArr[i][n].B > 30 && rgbaArr[i][n].B < 60 )
			{
				var hex = "#" + ("000000" + rgbToHex( rgbaArr[i][n].R , rgbaArr[i][n].G , rgbaArr[i][n].B )).slice(-6);
				return {  color: "green", hex: hex };
			}	
			else if ( rgbaArr[i][n].R > 100 && rgbaArr[i][n].R < 200 && rgbaArr[i][n].G > 50 && rgbaArr[i][n].G < 80 && rgbaArr[i][n].B > 10 && rgbaArr[i][n].B < 30 )
			{
				var hex = "#" + ("000000" + rgbToHex( rgbaArr[i][n].R , rgbaArr[i][n].G , rgbaArr[i][n].B )).slice(-6);
				return {  color: "oring", hex: hex };
			}
			else if ( rgbaArr[i][n].R > 10 && rgbaArr[i][n].R < 40 && rgbaArr[i][n].G > 80 && rgbaArr[i][n].G < 150 && rgbaArr[i][n].B > 80 && rgbaArr[i][n].B < 150 )
			{
				var hex = "#" + ("000000" + rgbToHex( rgbaArr[i][n].R , rgbaArr[i][n].G , rgbaArr[i][n].B )).slice(-6);
				return {  color: "blue", hex: hex };
			}
			else if ( rgbaArr[i][n].R > 100 && rgbaArr[i][n].R < 160 && rgbaArr[i][n].G > 0 && rgbaArr[i][n].G < 10 && rgbaArr[i][n].B > 100 && rgbaArr[i][n].B < 160 )
			{
				var hex = "#" + ("000000" + rgbToHex( rgbaArr[i][n].R , rgbaArr[i][n].G , rgbaArr[i][n].B )).slice(-6);
				return {  color: "violet", hex: hex };
			}	
		}	
	}

	return "noine";
}

function getTopAndBottomLine(findObjects, line = "top" )
{
	//Розподіляємо обэкти по рядам
		//Знаходимо верхній обєкт і переміщаємо його в перед масиву. Створюємо масив значень (в рядку)
		let inLineArr = [];
		for (var i = 0; i < findObjects.length; i++) 
		{
			if ( findObjects[0].top > findObjects[i].top)
			{
				let buf = findObjects[i].top;
				findObjects[i].top = findObjects[0].top;
				findObjects[0].top  = buf;
			}
	 		
			inLineArr[i] = false;
	 	}

 	let newArr = [];	
 	for (var i = 0; i < findObjects.length; i++) 
 	{
 		//якщо обєкт не знаходиться в рядку
 		if ( inLineArr[i] == false )
 		{
 			let newLine = [];
 				newLine[newLine.length] = findObjects[i];
 			inLineArr[i] = true;

 			let height =  findObjects[i].bottom - findObjects[i].top;
 			let mediane = findObjects[i].top+height/2;

 			
 			for (var n = 0; n < findObjects.length; n++) 
 			{
 				let thisTop = findObjects[n].top;
 				let thisBottom = findObjects[n].bottom;
 				let thisHeight = thisBottom - thisTop;

 				if( i != n && height*0.5 <  thisHeight && thisTop < mediane &&  thisBottom >  mediane )
 				{
 					newLine[newLine.length] = findObjects[n];
 					inLineArr[n] = true;
 				}

 			}
 			newArr[newArr.length] = newLine;
 		}	 
 	}
 	
 	//console.log(newArr);

 	//беремо верхній і нижній ряд із 3-х рядів
 	let newRetArr = [];
 	if ( newArr.length > 0 )
 	{
 		if ( line == "top"  ) for (var i = 0; i < newArr[0].length; i++)  newRetArr[newRetArr.length] = newArr[0][i];
 		else if( line = "bottom" ) for (var i = 0; i < newArr[newArr.length-1].length; i++)  newRetArr[newRetArr.length] = newArr[newArr.length-1][i];
 		else if( line = "all" )
 		{
 			for (var i = 0; i < newArr[0].length; i++)  newRetArr[newRetArr.length] = newArr[0][i];
 			for (var i = 0; i < newArr[newArr.length-1].length; i++)  newRetArr[newRetArr.length] = newArr[newArr.length-1][i];
 		}

 	}
 	console.log(newRetArr);

 	return newRetArr;
}