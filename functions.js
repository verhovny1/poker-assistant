 

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

 

exports.slice2dArr = function( arr , arg )
{
    let newArr = [];

    let count = 0;
    for (var i = arg.top; i <= arg.bottom; i++) 
    {
        newArr[count] = arr[i].slice(arg.left, arg.right );
        count++;
    }

    return newArr;
}















exports.binarize = function ( data, metod = 1 )
{

    //визначення прогу, в залежності від обраного методу
    var porog = 0;
    var count = data.length;
    

    if (metod == 1) 
        porog = 128;
    if (metod == 2) 
    {
        let max = 0; min = 255;
        for (var i = 0; i < count; i += 4) 
        {
            let R = data[i];
            let G = data[i + 1];
            var B = data[i + 2];
            let A = data[i + 3];
            let seredne = (R + B + G) / 3;

            if (seredne > max) max = seredne;
            if (seredne < min) min = seredne;
        }
        porog = min + (max - min) / 2;
    }

    else if (metod == 3) 
    {
        for (var i = 1; i < 255 ; i += 1) 
        {
            var Wite = 0, Dark = 0;
            for (var n = 0; n < count ; n += 4) 
            {
                var R = data[i];
                var G = data[i + 1];
                var B = data[i + 2];
                var seredne = (R + B + G) / 3;

                if (seredne <= i) Wite++; else Dark++;
            }
            if (Wite > Dark) 
            {
                porog = i;
                break;
            }
        }
    }


    //Заміна пікселей
    for (var i = 0; i < count ; i += 4) {
        var R = data[i];
        var G = data[i + 1];
        var B = data[i + 2];
        var A = data[i + 3];
        var seredne = (R + B + G) / 3;

        if (seredne > porog) 
        { 
            data[i] = 255; 
            data[i + 1] = 255; 
            data[i + 2] = 255; 
        }
        else 
        { 
            data[i] = 0; 
            data[i + 1] = 0; 
            data[i + 2] = 0; 
        }
    }
 
    return data;
}