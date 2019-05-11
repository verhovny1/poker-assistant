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
 


function getWindows()
{
  desktopCapturer.getSources({types: ['window', 'screen']}, (error, sources) => {
    
    if (error) throw error;
    let retArr = [];

    let text = "";
    for (let i = 0; i < sources.length; ++i)  
    {
    	retArr[i] = sources[i].name;
      	text += "<option value='"+retArr[i]+"' >"+retArr[i]+"</option>";
    }
    let windowsSelect = document.getElementById('windowsSelect');
	windowsSelect.innerHTML = text;
    
  });
}
getWindows();

//////////////////////////////////////////Події кнопок//////////////////////////////////////////
//Кнопка налаштувань програми
const settingsApp = document.getElementById('settingsAppBtn');
settingsApp.addEventListener('click', function(event)
{
	let windowsSelect = document.getElementById('windowsSelect');
 	let selWindow = windowsSelect.options[windowsSelect.selectedIndex].value;
 	let thumbSize = determinaScreenShot( percentageIncreaseSize );
	let option =  {types: ['window', 'screen'], thumbnailSize: thumbSize};

    desktopCapturer.getSources( option , (error, sources) => {
        if (error) throw error;

        for (let i = 0; i < sources.length; ++i) 
        {	
        	if (sources[i].name === selWindow) {
                
        		//console.log(sources[i]);
           		//console.log(sources[i].thumbnail.getBitmap());
				//console.log(sources[i].thumbnail.getSize());
				let bitmap = sources[i].thumbnail.getBitmap();
				let siz = sources[i].thumbnail.getSize();
				//bitmap = functions.binarize( bitmap , 2 );
           		//відкриваємо вікно налаштувань
			    ipcRenderer.send('modalWindow', 'show');
			    //ipcRenderer.send('modalWindow', { bitmap:newbitmap, width : imageWeight, height: imageHeight} );
			    arg = {}
			    arg.bitmap = bitmap;
			    arg.width = siz.width;
			    arg.height = siz.height;
			    ipcRenderer.send('modalWindowSendBitmap', arg );    
            }
        }
    });

});

 
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


//запуск рооти програми
const stopAppWor = document.getElementById('stopAppWorkBtn');
stopAppWor.addEventListener('click', function(event)
{
	isWork = false;
});

//запуск рооти програми
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
	let odjectsData = [];

	fs.readFile("config.tx", function(err, buf) {
	 	str = buf.toString();
	  	var res = str.split("\n");
	  	
	  	let playersCount = res[0].replace( "playersCount:", "");
	  	playersCount = parseInt( playersCount, 10 );
		odjectsData['playersCount'] =  playersCount;
		
		let counter = 1;
		for (var i = 1; i < res.length ; i+=7) 
		{
			let obj = {};
			obj.id = res[i+1].replace( "id:", "");
			obj.type = res[i+2].replace( "type:", "");
			obj.left = res[i+3].replace( "left:", "");
			obj.top = res[i+4].replace( "top:", "");
			obj.right = res[i+5].replace( "right:", "");
			obj.bottom = res[i+6].replace( "bottom:", "");

			odjectsData[ res[i].toString() ] = obj;
		}

		
	});

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
logText = "";
logText += "Start = " + getTime() + "\n";


	let windowsSelect = document.getElementById('windowsSelect');
 	let selWindow = windowsSelect.options[windowsSelect.selectedIndex].value;
 	let thumbSize = determinaScreenShot( percentageIncreaseSize );
	let option =  {types: ['window', 'screen'], thumbnailSize: thumbSize};
	let bitmap = [];

    desktopCapturer.getSources( option , (error, sources) => {
        if (error) throw error;

        for (let i = 0; i < sources.length; ++i) 
        {	
        	if (sources[i].name === selWindow) {
                
        		//console.log(sources[i]);
           		//console.log(sources[i].thumbnail.getBitmap());
				//console.log(sources[i].thumbnail.getSize());

				//отримуємо розміри та бітмап зображення
				let siz = sources[i].thumbnail.getSize();
				let bitmap = sources[i].thumbnail.getBitmap(); //.slice(0, siz.width * siz.height * 4);	
logText += "get bitmap = " + getTime() + "\n";
			
				//перетворюємо bitmap в 2Д масив
	      		let data = functions.getRGB2dArr( bitmap, siz.width, siz.height);
logText += "convert to 2D arr = " + getTime() + "\n";
functions.setArrToCanvas( data , "canvas1");	
 
/*
 				//Розмиваємо
				data = functions.blurryColorImg(data,  1, "averaging-to-new" );
logText += "get blurry = " + getTime() + "\n";
functions.setArrToCanvas( data , "canvas2");	

				//Бінаризуємо
				data = functions.binarize( data , 4, 2,140 );
logText += "binarize bitmap = " + getTime() + "\n";
functions.setArrToCanvas( data , "canvas3");
 				*/
		      		    		 
		      		let playersCount = odjectsData['playersCount']; //кількість гравців

	      			//вирізать з зображення обєкти
	      			for (var i = 1; i <= playersCount*2+1; i++) 
	      			{
	      				let area = odjectsData['Area'+i.toString() ];
	      				let areaData = functions.slice2dArr( data, area );
	      				odjectsData['Area'+i.toString() ]['data'] = areaData;
			
	      			}
logText += "gets areas from img = " + getTime() + "\n";


logText += "start recognition = " + getTime() + "\n"; 
	      			let dataArr = odjectsData['Area1']['data'];
functions.setArrToCanvas( dataArr , "canvas2");

	 
					dataArr = functions.blurryColorImg(dataArr,  1, "averaging-to-new" );
logText += "get blurry = " + getTime() + "\n";
functions.setArrToCanvas( dataArr , "canvas3");

				dataArr = functions.binarize( dataArr , 4, 2, 128 );
logText += "binarize  = " + getTime() + "\n";
functions.setArrToCanvas( dataArr , "canvas4");

				let dataArr16x16 = functions.resampleSingleArr(dataArr, 16, 16);
logText += "resample  = " + getTime() + "\n";
functions.setArrToCanvas( dataArr16x16 , "canvas5");

	   				/*let dataArrBl1 = functions.blurryColorImg(dataArr, 2, "averaging");
	   					functions.setArrToCanvas( dataArrBl1 , "canvas2");
	   				let dataArrBl2 = functions.blurryColorImg(dataArr, 2, "averaging-to-new");
	   					functions.setArrToCanvas( dataArrBl2 , "canvas3");
	   				dataArr = functions.binarize( dataArr, 1 , 2 );
	   					functions.setArrToCanvas( dataArr , "canvas4");
	   				dataArrBl1 = functions.binarize( dataArr, 1 , 2 );
	   					functions.setArrToCanvas( dataArrBl1 , "canvas5");
	   				dataArrBl2 = functions.binarize( dataArr, 1 , 2 );
	   					functions.setArrToCanvas( dataArrBl2 , "canvas6");*/

	     


					

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
        }
    });

}








 