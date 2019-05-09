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
 


//////////////////////////////////////////Події кнопок//////////////////////////////////////////
//Кнопка налаштувань програми
const settingsApp = document.getElementById('settingsAppBtn');
settingsApp.addEventListener('click', function(event)
{
  	let thumbSize = determinaScreenShot( percentageIncreaseSize );
  	let imageWeight = sizeScreenShot( percentageIncreaseSize ).width;
  	let imageHeight = sizeScreenShot( percentageIncreaseSize ).height;

	let options = { types:['window','screen'], thumbnailSize: thumbSize };
 
	desktopCapturer.getSources(options,function(error, sources)
	{
    	if(error) return console.log(error.massage);
    	sources.forEach(function(source)
    	{
    		if(source.name === "Entire screen" || source.name === "Screen 1" )
      		{
      			 

				//console.log(source);
				//console.log(source.thumbnail.toPNG() );
 			 
		 		/*
		 		const screenshotPath = path.join(os.tmpdir(), 'screenshot.png')
		        fs.writeFile(screenshotPath, source.thumbnail.toPNG(), function (error) {
		        	if (error) return console.log(error)
		          	shell.openExternal('file://' + screenshotPath) 
		        }) */

	      		//забираємо масив пікселів з зображення
	      		let bitmap = source.thumbnail.getBitmap();
	      		let newbitmap = bitmap.slice(0, imageWeight * imageHeight * 4);
	      		 
 
			    //Зберігаємо в канвас
	 			//setArrToCanvas( bitmap, "canv1");
  
  				//відкриваємо вікно налаштувань
			    ipcRenderer.send('modalWindow', 'show');
			    //ipcRenderer.send('modalWindow', { bitmap:newbitmap, width : imageWeight, height: imageHeight} );
			    arg = {}
			    arg.bitmap = newbitmap;
			    arg.width = imageWeight;
			    arg.height = imageHeight;
			    ipcRenderer.send('modalWindowSendBitmap', arg );
			    console.log(bitmap[0]);console.log(bitmap[1]);
      		}
    	});
  	});	
});

//запуск рооти програми
const startAppWork = document.getElementById('startAppWorkBtn');
startAppWork.addEventListener('click', function(event)
{
	isWork = true;
	timerApp();
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

//////////////////////////////////////////Функці допоміжні//////////////////////////////////////////
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

//Записати пікслелiв в канвас
function setArrToCanvas( dataArray , canvasId)
{
	const thumbSize = determinaScreenShot();
    let W = thumbSize.width;
    let H = thumbSize.height;

    //находим canvas
    var canvas = document.getElementById(canvasId);
    canvas.width =  W;
    canvas.height =  H;
    canvas.style.width = W + "px";
    canvas.height.width = H + "px"; 
  
    var context = canvas.getContext('2d');
	var myImageData = context.createImageData( W, H);
	for (i = 0; i < dataArray.length; i += 1)  
		myImageData.data[i] = dataArray[i];

	context.putImageData(myImageData, 0, 0); 
}

 
//////////////////////////////////////////Функці обробки та розпізнавання//////////////////////////////////////////

//на вході масив пікселів зображення
//на виході масив розпізнаних обєктів
function mainRecognition( )
{
	let thumbSize = determinaScreenShot( percentageIncreaseSize );
  	let imageWeight = sizeScreenShot( percentageIncreaseSize ).width;
  	let imageHeight = sizeScreenShot( percentageIncreaseSize ).height;
	let options = { types:['screen'], thumbnailSize: thumbSize };
 	let bitmap = [];

	desktopCapturer.getSources(options,function(error, sources)
	{
    	if(error) console.log(error.massage);
    	sources.forEach(function(source)
    	{
    		if(source.name === "Entire screen" || source.name === "Screen 1" )
      		{

      			//percentageIncreaseSize - змына розмiру зображення https://github.com/lovell/sharp

	      		//забираємо масив пікселів з зображення
	      		bitmap = source.thumbnail.getBitmap().slice(0, imageWeight * imageHeight * 4);	      		
	      		console.log( bitmap );

	      		data = functions.getRGB2dArr( bitmap, imageWeight, imageHeight);
	      		console.log(data[0][0]);
 
	      			//взять з куків данні про положення обєктів

					//вирізать їх з зображення в окремі обєкти

					//Розпаралеленя
						//обробка зображенння
						//сегментація
						//налаштування нейронної мережі та розпізнавання обєктів
						//формування вихідного результату
					//повернення або друк масиву знайдених обєктів
	      	 
      		}
    	});
  	});	

	 

}