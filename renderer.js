// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
 //Обявлення констант
const electron = require("electron")
const { ipcRenderer, remote } = require('electron');
	const desktopCapturer = electron.desktopCapturer;
	const electronScreen = electron.screen; 
	const shell = electron.shell;
 

const functions = require('./functions.js');
	let isWork = false;
	let percentageIncreaseSize = 1;
	let logText = "";
 
const fs = require('fs')
const os = require('os')
const path = require('path')



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

				bitmap = functions.binarize( bitmap , 2 );

logText += "binarize bitmap = " + getTime() + "\n";

 				//перетворюємо його в 2Д масив
	      		let data = functions.getRGB2dArr( bitmap, siz.width, siz.height);



logText += "convert to 2D arr = " + getTime() + "\n";

		      		
		      		//console.log(odjectsData); 
		      		let playersCount = odjectsData['playersCount']; //кількість гравців
	      			//console.log(playersCount); 
	      			

	      			//вирізать з зображення обєкти

	      			for (var i = 1; i <= playersCount*2+1; i++) 
	      			{
	      				let area = odjectsData['Area'+i.toString() ];
	      				let areaData = functions.slice2dArr( data, area );
	      				odjectsData['Area'+i.toString() ]['data'] = areaData;
			
	      			}

logText += "gets areas from img = " + getTime() + "\n";

 
	      			console.log(odjectsData['Area1']['data']);
	   
	     
logText += "start recognition = " + getTime() + "\n";


					//Розпаралеленя 
						//обробка зображенння
						//сегментація
						//налаштування нейронної мережі та розпізнавання обєктів
						//формування вихідного результату
					//повернення або друк масиву знайдених обєктів

logText += "End recognitio = " + getTime() + "\n";


 
logText += "End process " + getTime() + "\n";
//document.getElementById('outDataTextera').text = logText;
$('#outDataTextera').val( logText);
            }
        }
    });

}








 