 

document.onkeydown = function(e) 
{
	
    console.log("Клавиша "+e.keyCode);

};
 
 


//Формує 2д масив (RGBA) значень з вхідного 1д масиву пікселей imageData.data, ширини та висоти зображення
//Звернення до результатів відб. наступним чином: A[i][j].R
exports.getRGB2dArr = function(arr,w,h)
{  
    var PointsMas = []; //сам масив точок   (зверненя: PointsMas[1][1]["B"]  або PointsMas[1][1].B де В=(R,G,B,A)
    var counter = 0; //$("#TrackingjsData").append("<br>");  
    for (var i = 0; i < h ; i++) {
        SummMass = []; // проміжний масив-строка 
        for (var n = 0; n < w  ; n++) {
            var MY_RGBA = {}; // проміжний обєкт для запису свойств
            MY_RGBA.R = arr[counter];
            MY_RGBA.G = arr[counter + 1];
            MY_RGBA.B = arr[counter + 2];
            MY_RGBA.A = arr[counter + 3];
            SummMass[n] = MY_RGBA;
            counter += 4;
        };  
        PointsMas[i] = SummMass;  
    };

    return PointsMas
}
//Формує 1д масив пікселей imageData.data з вхідного 2д (RGBA) масиву типу A[i][j].R
exports.set2dArrRGB = function(arr)
{
    var retArr = new Array();
    var count = 0;

    for (i = 0; i<arr.length;i++)
    {
        for (n = 0; n<arr[i].length;n++)
        {
            retArr[count] = arr[i][n].R;
            retArr[count+1] = arr[i][n].G;
            retArr[count+2] = arr[i][n].B;
            retArr[count + 3] = arr[i][n].A;

            count += 4;
        }
    }

    return retArr;
}
//Функція конвертації 1д масиву в 2д. на вході масив і ширина та висота вихідного масиву
exports.C1Dto2D = function ( A1D,n,m )
{
    var num = 0;
    var A2D = new Array();

    for( var i = 0; i < n; i++)
    {
        A2D[i] = new Array();
        for ( var j = 0; j < m; j++)
        {
            A2D[i][j] = A1D[num];
            num++;
        }
    }

    return A2D;
}
//функція конвертації 2д масиву в 1д. на вході 2д масив, на виході 1д масив.
exports.C2Dto1D = function  ( arr )
{
    var retAr = [];

    for (var k = 0; k < arr.length; k++) 
    {
        for (var p = 0; p < arr[k].length; p++) 
        {
            retAr[ arr.length * k + p] = arr[k][p];
        }
    }  

    return retAr;
}

exports.getMaxMinVal = function( val1, val2)
{
    let retVal = {};
    if ( val1 >= val2 )
    {
        retVal.max = val1;
        retVal.min = val2;
    } else{
        retVal.max = val2;
        retVal.min = val1;
    }

    return retVal;
}


exports.getRGBA = function(r,g,b,a)
{
    RGBA = {};
    RGBA.R = r;
    RGBA.G = g;
    RGBA.B = b;
    RGBA.A = a;

    return RGBA;
}


exports.draRestlengOnCanvas = function(canvasId,canvastoId, x1,y1,x2,y2 , RGBA)
{
    //находим canvas
    var canvas = document.getElementById(canvasId);
    // получаем его 2D контекст
    var context = canvas.getContext('2d');
    // получаем объект, описывающий внутреннее состояние области контекста
    var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    var data = imageData.data;  


    //розпаковуємо одномірний масив R D G A в 2Д масив  R D G A
    var pA = this.getRGB2dArr(data, canvas.width, canvas.height);
    var MYleft=this.getMaxMinVal(x1, x2).min;
    var MYtop=this.getMaxMinVal(y1, y2).min;
    var MYright=this.getMaxMinVal(x1, x2).max;
    var MYbottom=this.getMaxMinVal(y1, y2).max;

        for (var m = MYtop; m <= MYbottom; m++) { pA[m][MYleft].R = RGBA.R; pA[m][MYleft].G = RGBA.G; pA[m][MYleft].B = RGBA.B; pA[m][MYleft].A = RGBA.A;  }
        for (var m = MYtop; m <= MYbottom; m++) { pA[m][MYright].R = RGBA.R; pA[m][MYright].G = RGBA.G; pA[m][MYright].B = RGBA.B; pA[m][MYright].A = RGBA.A;}
        for (var m = MYleft; m <= MYright; m++) { pA[MYtop][m].R = RGBA.R; pA[MYtop][m].G = RGBA.G; pA[MYtop][m].B = RGBA.B; pA[MYtop][m].A = RGBA.A;}
        for (var m = MYleft; m <= MYright; m++) { pA[MYbottom][m].R = RGBA.R; pA[MYbottom][m].G = RGBA.G; pA[MYbottom][m].B = RGBA.B; pA[MYbottom][m].A = RGBA.A;}

    //Упаковуємо 2Д масив R D G A в одномірний
    dataArray = this.set2dArrRGB(pA);
    //Замінюємо елементи у масиві пікселей imageData.data
    for (var i = 0; i < data.length; i += 1) { data[i] = dataArray[i]; }

    // создаем или находим canvas
    var canvasTo = document.getElementById(canvastoId);
        canvasTo.width = canvas.width;
        canvasTo.height = canvas.height;
        canvasTo.style.width = canvas.style.width;
        canvasTo.style.height = canvas.style.height;
    // получаем его 2D контекст
    var contextTo = canvasTo.getContext('2d');
    //вставляємо imageData у context канваса
    contextTo.putImageData(imageData, 0, 0);
}