//утворення констант
const { ipcRenderer, remote } = require( "electron" );
const electron = require("electron")
const desktopCapturer = electron.desktopCapturer;
const electronScreen = electron.screen; 
const shell = electron.shell;
const { session } = require('electron')

const fs = require('fs')
const os = require('os')
const path = require('path')

let bitmap = null;
let bitmapW = null;
let bitmapH = null;

const functions = require('./functions.js');
let activeObject = null;
let odjectsData = {};

//функція отримання поввідомлень (bitmap зображення)
ipcRenderer.on('bitmap', (event, arg) => {
    bitmap = arg.bitmap ;
    bitmapW = arg.width;
    bitmapH = arg.height
 
    readConfig();
    setArrToCanvas( arg.bitmap, arg.width, arg.height, "modalCanv");
    loadPlayers( odjectsData['playersCount'] );
    loadPlayers( 10 );
});

//Записати пікслелiв в канвас
function setArrToCanvas( dataArray, W,H , canvasId, restAr = null)
{
    //находим canvas
    let canvas = document.getElementById(canvasId);
    canvas.width =  W;
    canvas.height =  H;
    canvas.style.width = Math.round(W*440/H )+ "px";
    canvas.style.height = "440px"; 
  
    let context = canvas.getContext('2d');
	let myImageData = context.createImageData( W, H );
	for (i = 0; i < dataArray.length; i += 1) myImageData.data[i] = dataArray[i];

	context.putImageData(myImageData, 0, 0); 

	if ( restAr != null )
	{
		let x1 = Math.min(restAr.x1,restAr.x2);
		let x2 = Math.max(restAr.x1,restAr.x2);
		let y1 = Math.min(restAr.y1,restAr.y2);
		let y2 = Math.max(restAr.y1,restAr.y2);

		// Red rectangle
		context.beginPath();
		context.lineWidth = "2";
		context.strokeStyle = "red";
        context.lineJoin = "round";
        context.rect(  x1,  y1, x2 - x1, y2 - y1 );
        context.closePath();
		context.stroke();
		console.log( restAr );
	} 
}
 

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Event buttons//////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
const load5Pleyer = document.getElementById('load5PleyerBtn');
load5Pleyer.addEventListener('click', function(event)
{
	loadPlayers( 5 );

}); 
const load10Pleyer = document.getElementById('load10PleyerBtn');
load10Pleyer.addEventListener('click', function(event)
{
	loadPlayers( 10 );

}); 
function loadPlayers( count = 5 )
{
	odjectsData['playersCount'] = count; 

	let divElements = document.getElementById('divElements');
	let tex5 = '<div class="form-inline"><div class="form-group mb-2"><div class="appObj" id="Area1" ><input id="inp1" value="cardsOnTable" style="display: none;"><input type="radio" id="Area1ChB"  name="rb"><label>Cards on table</label></div><div class="appObj" id="Area2" ><input id="inp2" value="CardsOfPlayer1" style="display: none;"><input type="radio" id="Area2ChB" name="rb"><label>Cards of player 1 (My cards)</label></div><div class="appObj" id="Area3" ><input id="inp3" value="AreaOfPlayer1" style="display: none;"><input type="radio" id="Area3ChB" name="rb"><label>Area of 1 (My cards)</label></div><div class="appObj" id="Area4" ><input id="inp4" value="CardsOfPlayer2" style="display: none;"><input type="radio" id="Area4ChB" name="rb"><label>Cards of player 2</label></div><div class="appObj" id="Area5" ><input id="inp5" value="AreaOfPlayer2" style="display: none;"><input type="radio" id="Area5ChB" name="rb"><label>Area of player 2</label></div><div class="appObj" id="Area6" ><input id="inp6" value="CardsOfPlayer3" style="display: none;"><input type="radio" id="Area6ChB" name="rb"><label>Cards of player 3</label></div><div class="appObj" id="Area7" ><input id="inp7" value="AreaOfPlayer3" style="display: none;"><input type="radio" id="Area7ChB" name="rb"><label>Area of player 3</label></div><div class="appObj" id="Area8" ><input id="inp8" value="CardsOfPlaye4" style="display: none;"><input type="radio" id="Area8ChB" name="rb"><label>Cards of player 4</label></div><div class="appObj" id="Area9" ><input id="inp9" value="AreaOfPlayer4" style="display: none;"><input type="radio" id="Area9ChB" name="rb"><label>Area of player 4</label></div><div class="appObj" id="Area10" ><input id="inp10" value="CardsOfPlayer5" style="display: none;"><input type="radio" id="Area10ChB" name="rb"><label>Cards of player 5</label></div><div class="appObj" id="Area11" ><input id="inp11" value="AreaOfPlayer5" style="display: none;"><input type="radio" id="Area11ChB" name="rb"><label>Area of player 5</label></div>';
	let tex10 = '<div class="form-inline"><div class="form-group mb-2"><div class="appObj" id="Area1" ><input id="inp1" value="cardsOnTable" style="display: none;"><input type="radio" id="Area1ChB"  name="rb"><label>Cards on table</label></div><div class="appObj" id="Area2" ><input id="inp2" value="CardsOfPlayer1" style="display: none;"><input type="radio" id="Area2ChB" name="rb"><label>Cards of player 1 (My cards)</label></div><div class="appObj" id="Area3" ><input id="inp3" value="AreaOfPlayer1" style="display: none;"><input type="radio" id="Area3ChB" name="rb"><label>Area of 1 (My cards)</label></div><div class="appObj" id="Area4" ><input id="inp4" value="CardsOfPlayer2" style="display: none;"><input type="radio" id="Area4ChB" name="rb"><label>Cards of player 2</label></div><div class="appObj" id="Area5" ><input id="inp5" value="AreaOfPlayer2" style="display: none;"><input type="radio" id="Area5ChB" name="rb"><label>Area of player 2</label></div><div class="appObj" id="Area6" ><input id="inp6" value="CardsOfPlayer3" style="display: none;"><input type="radio" id="Area6ChB" name="rb"><label>Cards of player 3</label></div><div class="appObj" id="Area7" ><input id="inp7" value="AreaOfPlayer3" style="display: none;"><input type="radio" id="Area7ChB" name="rb"><label>Area of player 3</label></div><div class="appObj" id="Area8" ><input id="inp8" value="CardsOfPlaye4" style="display: none;"><input type="radio" id="Area8ChB" name="rb"><label>Cards of player 4</label></div><div class="appObj" id="Area9" ><input id="inp9" value="AreaOfPlayer4" style="display: none;"><input type="radio" id="Area9ChB" name="rb"><label>Area of player 4</label></div><div class="appObj" id="Area10" ><input id="inp10" value="CardsOfPlayer5" style="display: none;"><input type="radio" id="Area10ChB" name="rb"><label>Cards of player 5</label></div><div class="appObj" id="Area11" ><input id="inp11" value="AreaOfPlayer5" style="display: none;"><input type="radio" id="Area11ChB" name="rb"><label>Area of player 5</label></div><div class="appObj" id="Area12" ><input id="inp12" value="CardsOfPlaye6" style="display: none;"><input type="radio" id="Area12ChB" name="rb"><label>Cards of player 6</label></div><div class="appObj" id="Area13" ><input id="inp13" value="AreaOfPlayer6" style="display: none;"><input type="radio" id="Area13ChB" name="rb"><label>Area of player 6</label></div><div class="appObj" id="Area14" ><input id="inp14" value="CardsOfPlayer7" style="display: none;"><input type="radio" id="Area14ChB" name="rb"><label>Cards of player 7</label></div><div class="appObj" id="Area15" ><input id="inp15" value="AreaOfPlayer7" style="display: none;"><input type="radio" id="Area15ChB" name="rb"><label>Area of player 7</label></div><div class="appObj" id="Area16" ><input id="inp16" value="CardsOfPlayer8" style="display: none;"><input type="radio" id="Area16ChB" name="rb"><label>Cards of player 8</label></div><div class="appObj" id="Area17" ><input id="inp17" value="AreaOfPlayer8" style="display: none;"><input type="radio" id="Area17ChB" name="rb"><label>Area of player 8</label></div><div class="appObj" id="Area18" ><input id="inp18" value="CardsOfPlayer9" style="display: none;"><input type="radio" id="Area18ChB" name="rb"><label>Cards of player 9</label></div><div class="appObj" id="Area19" ><input id="inp19" value="AreaOfPlayer9" style="display: none;"><input type="radio" id="Area19ChB" name="rb"><label>Area of player 9</label></div><div class="appObj" id="Area20" ><input id="inp20" value="CardsOfPlaye10" style="display: none;"><input type="radio" id="Area20ChB" name="rb"><label>Cards of player 10</label></div><div class="appObj" id="Area21" ><input id="inp21" value="AreaOfPlayer10" style="display: none;"><input type="radio" id="Area21ChB" name="rb"><label>Area of player 10</label></div></div></div>';
	if ( count == 5 ) divElements.innerHTML = tex5;
	else if ( count == 10 ) divElements.innerHTML = tex10;


	for (var i = 0; i < count*2 + 1; i++) 
	{		
		let nom = i+1;
		let Area = "Area" + nom.toString();
		let ChB =  "Area" + nom.toString() + "ChB";
		let inp = "inp" + nom.toString();

		let cardsOnTheTable = document.getElementById( Area );
		cardsOnTheTable.addEventListener('click', function(event)
		{
			let cardsOnTheTableChb = document.getElementById( ChB );
			let cardsType = document.getElementById( inp );
			if ( cardsOnTheTableChb.checked == false )
			{
				cardsOnTheTableChb.checked = true; 
				
				let objDt = {};
				objDt.id = cardsOnTheTable.id;
				objDt.type = cardsType.value;
				activeObject = objDt;
				//console.log(odjectsData);
				//for (var key in odjectsData) {  console.log(odjectsData[key]) }; 

				let data = odjectsData[ activeObject.id ];
				setArrToCanvas( bitmap, bitmapW,bitmapH , "modalCanv", { x1: data.left , y1: data.top ,x2:data.right ,y2:data.bottom } );

			}
			else 
			{
				cardsOnTheTableChb.checked = false;
				activeObject = null;

				setArrToCanvas( bitmap, bitmapW,bitmapH , "modalCanv" );
			}
		});


	}
}

const closseModalBtn = document.getElementById('closseModalBtn');
closseModalBtn.addEventListener('click', function(event)
{
	ipcRenderer.send('modalWindow', 'hide');
});
 

///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Peint //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
let firstCoord = null;
let secondCoord = null;

const modalCanv = document.getElementById('modalCanv');
modalCanv.addEventListener('click', function(event)
{
	if ( activeObject != null ) 
	{
		//визначамо координати на зображенні
		let x = event.clientX - modalCanv.offsetLeft ;
	    let y = event.clientY - modalCanv.offsetTop  ;
	    let proc = bitmapH / 440;
	    x = Math.round( x * proc);
	    y = Math.round( y * proc);

	    if ( firstCoord == null)
		{
			firstCoord = {};
			firstCoord.X = x;
			firstCoord.Y = y;
		}
		else
		{
			secondCoord = {};
			secondCoord.X = x;
			secondCoord.Y = y;
			
			//Записать данні 
			let topObj = Math.min( firstCoord.Y, secondCoord.Y);
			let bottomObj = Math.max( firstCoord.Y, secondCoord.Y);
			let leftObj = Math.min( firstCoord.X, secondCoord.X);
			let rightbj = Math.max( firstCoord.X, secondCoord.X);

			let objDt = {};
			objDt.id = activeObject.id;
			objDt.type = activeObject.type;
			objDt.top = topObj;
			objDt.bottom = bottomObj;
			objDt.left = leftObj;
			objDt.right = rightbj;
			//запис в глоб масив.
			odjectsData[ activeObject.id ] = objDt;
			//зберігаємо
		 	writeConfig();
 
		 	//Стираємо данні координат
			firstCoord = null;
			secondCoord = null;
		}

		
	}

}, false);


modalCanv.addEventListener("mousemove", function(event)
{
	//визначамо координати на зображенні
	let x = event.clientX - modalCanv.offsetLeft ;
    let y = event.clientY - modalCanv.offsetTop  ;
    let proc =     bitmapH / 440;
    x = Math.round( x * proc);
    y = Math.round( y * proc);
 
    if ( firstCoord != null)
    {
    	setArrToCanvas( bitmap, bitmapW,bitmapH , "modalCanv", { x1: firstCoord.X ,y1:firstCoord.Y ,x2:x ,y2:y } );
    }

});



///////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////Config //////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////
function readConfig()
{
	const config = require('./config.js');
	odjectsData = config.getConfig();
}
function writeConfig()
{
	const config = require('./config.js');
	config.setConfig( odjectsData ) ;
}