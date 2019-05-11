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
 
//Функція для вирізання 2Д масиву
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

//Функція для відображення масиву пікселів на канвасі
exports.setArrToCanvas = function( arr , canvasId)
{
    let H = arr.length;
    let W = 1;
    if ( H > 0 )  W =  arr[0].length;
    
    //находим canvas
    let canvas = document.getElementById(canvasId);
    canvas.width = W;
    canvas.height = H;
    canvas.style.width = W;
    canvas.height.width = H;

    let context = canvas.getContext('2d');
    let imageData = context.getImageData(0, 0, W, H);
    let data = imageData.data;

    //розпаковуємо одномірний масив R D G A в 2Д масив  R D G A
    let pA = this.getRGB2dArr(data, W, H);

    for (let i = 0; i < arr.length; i++)
    {
        for (let n = 0; n < arr[i].length; n++)
        {
            pA[i][n].R =  arr[i][n].R;
            pA[i][n].G =  arr[i][n].G;
            pA[i][n].B =  arr[i][n].B;
            pA[i][n].A =  arr[i][n].A;
        }
    }

    //Упаковуємо 2Д масив R D G A в одномірний
    dataArray = this.set2dArrRGB(pA);
    for (i = 0; i < data.length; i += 1) { data[i] = dataArray[i]; }
    context.putImageData(imageData, 0, 0);
}











//функція бінаризації зображення
//На вході: 
//data - одновимірний, або двовимірний маасив типу A[i][j].R
//metod - метод проведення бінаризації 1,2 або 3 (за замовчуванням 1)
//typeArr - тип масиву - 1 (одновимірний) або 2 (двовимірний)
//На виході масив  data
exports.binarize = function ( data, metod = 1, typeArr = 1, setingPorog = 128 )
{
    let W,H=0;
    if (typeArr == 2) //якщо 2д масив
    {
        H = data.length;
        W = data[0].length;
        data = this.set2dArrRGB(data);
    }

    //визначення прогу, в залежності від обраного методу
    var porog = 0;
    var count = data.length;
    let R,G,B,A,seredne = 0;

    if (metod == 1) 
        porog = 128;
    if (metod == 2) 
    {
        let max = 0; min = 255;
        for (let i = 0; i < count; i += 4) 
        {
            R = data[i];
            G = data[i + 1];
            B = data[i + 2];
            A = data[i + 3];
            seredne = (R + B + G) / 3;

            if (seredne > max) max = seredne;
            if (seredne < min) min = seredne;
        }
        porog = min + (max - min) / 2;
    }

    else if (metod == 3) 
    {
        for (let i = 1; i < 255 ; i += 1) 
        {
            let Wite = 0, Dark = 0;
            for (let n = 0; n < count ; n += 4) 
            {
                R = data[i];
                G = data[i + 1];
                B = data[i + 2];
                seredne = (R + B + G) / 3;

                if (seredne <= i) Wite++; else Dark++;
            }
            if (Wite > Dark) 
            {
                porog = i;
                break;
            }
        }
    }
    else if (metod == 4)  porog = setingPorog;

    //Заміна пікселей
    for (let i = 0; i < count ; i += 4) {
        R = data[i];
        G = data[i + 1];
        B = data[i + 2];
        A = data[i + 3];
        seredne = (R + B + G) / 3;

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
 

    if (typeArr == 2) //якщо 2д масив
    {
        data = this.getRGB2dArr(data,W,H);
    }

    return data;
}








//функція розмиття кольорового або сірого зображенння
//вхідні параметри:
//data - віхідний 2Д масив
//core(2-ій параметр(не обовязково) ) - описує величину ядра розмивки та приймає значення 0,1,2... що значить розміри ядра
//1 - вхідне зобр. не змін., 3х3, 5х5...  відповідно
//metod (3-iй параметр(не обовязково) ) - описує метод розмиття зображення та приймає значеня: averaging, averaging-to-new, gauss, median. 
exports.blurryColorImg = function (data,   core = 1, metod = "averaging" )
{
    let H = data.length;
    let W = data[0].length;

 
    //Проводимо розмиття
    if (metod == "averaging")
    {
        for (i = 0; i < H ; i++) {
            for (j = 0; j < W; j++) {
 
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                let count = 0;
                for (m = i - core; m <= i + core; m++)
                    for (n = j - core; n <= j + core; n++)
                        if (m >= 0 && m < H && n >= 0 && n < W)
                        {
                            sumR += data[m][n].R;
                            sumG += data[m][n].G;
                            sumB += data[m][n].B;
                            sumA += data[m][n].A;
                            count++;
                        }
                data[i][j].R = Math.round(sumR / count);
                data[i][j].G = Math.round(sumG / count);
                data[i][j].B = Math.round(sumB / count);
                data[i][j].A = Math.round(sumA / count);
            }
        }
    }
    
    else if (metod == "averaging-to-new")
    {
        let pA = [];

        for (i = 0; i < H ; i++) 
        {
            let pA_2 = [];
            for (j = 0; j < W; j++) {
 
                let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
                let count = 0;
                for (m = i - core; m <= i + core; m++)
                    for (n = j - core; n <= j + core; n++)
                        if (m >= 0 && m < H && n >= 0 && n < W)
                        {
                            sumR += data[m][n].R;
                            sumG += data[m][n].G;
                            sumB += data[m][n].B;
                            sumA += data[m][n].A;
                            count++;
                        }
                pA_2[j] = { R: Math.round(sumR / count) , G: Math.round(sumG / count), B : Math.round(sumB / count), A: Math.round(sumA / count) } 
            }
            pA[i] = pA_2;
        }
        data = pA;
    }
   
    else if (metod == "gauss")
    {

    }
    else if (metod == "median")
    {

    }
 
    
 
    return data;
}


//Ресайз зображення
//вхідні параметри:
//arr - 2Д масив 
//width i height - бажані розміри зображення
exports.resampleSingleArr = function(arr, width, height)
{   
    var height_source = 0;
    var width_source = 0;
    try
    { 
        height_source = arr.length;
        width_source = arr[0].length;
    }
    catch( e ) {
        ar2 = ["255"]; 
        arr = [ ar2 ];  
        height_source = 1;
        width_source = 1;
    }

    width = Math.round(width);
    height = Math.round(height);

    var ratio_w = width_source / width;
    var ratio_h = height_source / height;
    var ratio_w_half = Math.ceil(ratio_w / 2);
    var ratio_h_half = Math.ceil(ratio_h / 2);


    var data = []; var count = 0;
    for (var i = 0; i < height_source; i++) {
        for (var n = 0; n < width_source; n++) 
        {
            data[count] = arr[i][n].R;
            data[count+1] = arr[i][n].G;
            data[count+2] = arr[i][n].B;
            data[count+3] = arr[i][n].A;
            count+=4;
        }
    } 
    var data2 = [];
    for (var i = 0; i <  width *  height * 4; i++) data2[i] = "0";

    for (var j = 0; j < height; j++) {
        for (var i = 0; i < width; i++) {
            var x2 = (i + j * width) * 4;
            var weight = 0;
            var weights = 0;
            var weights_alpha = 0;
            var gx_r = 0;
            var gx_g = 0;
            var gx_b = 0;
            var gx_a = 0;
            var center_y = (j + 0.5) * ratio_h;
            var yy_start = Math.floor(j * ratio_h);
            var yy_stop = Math.ceil((j + 1) * ratio_h);
            for (var yy = yy_start; yy < yy_stop; yy++) {
                var dy = Math.abs(center_y - (yy + 0.5)) / ratio_h_half;
                var center_x = (i + 0.5) * ratio_w;
                var w0 = dy * dy; //pre-calc part of w
                var xx_start = Math.floor(i * ratio_w);
                var xx_stop = Math.ceil((i + 1) * ratio_w);
                for (var xx = xx_start; xx < xx_stop; xx++) {
                    var dx = Math.abs(center_x - (xx + 0.5)) / ratio_w_half;
                    var w = Math.sqrt(w0 + dx * dx);
                    if (w >= 1) {
                        //pixel too far
                        continue;
                    }
                    //hermite filter
                    weight = 2 * w * w * w - 3 * w * w + 1;
                    var pos_x = 4 * (xx + yy * width_source);
                    //alpha
                    gx_a += weight * data[pos_x + 3];
                    weights_alpha += weight;
                    //colors
                    if (data[pos_x + 3] < 255)
                        weight = weight * data[pos_x + 3] / 250;
                    gx_r += weight * data[pos_x];
                    gx_g += weight * data[pos_x + 1];
                    gx_b += weight * data[pos_x + 2];
                    weights += weight;
                }
            }
            data2[x2] = Math.round( gx_r / weights);
            data2[x2 + 1] = Math.round( gx_g / weights);
            data2[x2 + 2] = Math.round( gx_b / weights );
            data2[x2 + 3] = Math.round( gx_a / weights_alpha );
        }
    }

    return this.getRGB2dArr(data2,width,height);
}



//Формує масив обєктів з координатами верху,низу,ліво,право типу findObjects[№ обєкта]top та масиву координат пікселей X,Y типу findObjects[№ обєкта].obg[№ пікселя].X
//На вході масив типу A[][].R де R може бути R,G,B,A 
exports.segmentationArrayPixelscan = function (arr, metod = "all")
{
    var H = arr.length; 
    var W = arr[0].length;

    //створюємо масив показуючий наявність пікселя
    var isEmpty = new Array();
    for (i=0;i<H;i++){
        wr = new Array();
        for (n=0;n<W;n++){
            wr[n] = true;
        }
        isEmpty[i] = wr;
    }
    
    var findObjects = new Array();//масив для знайдених обєктів
    //тепер пройдемося по кажному пікселю зображення
    for (i = 0; i < H; i++)//згори до низу
    {
        for (n = 0; n < W; n++)//зліва на право
        {
            
            //якщо піксель не існує
            if (isEmpty[i][n] == false) { }
            //якщо піксель існує і він білий - пропускаємо, видаляючи піксель
            else if (isEmpty[i][n] == true && arr[i][n].R != 0)
            {
                isEmpty[i][n] = false;
            }
            //якщо піксель існує і він чорного кольору - виявлено обєкт - починаємо виявляти всі його піксклі
            else if (isEmpty[i][n] == true && arr[i][n].R == 0)
            {
                //поміщаємо знайдений піксель у буфер та видаляємо його з існуючих
                var newObj = {};
                newObj.X = n;
                newObj.Y = i;
                var buf = new Array();//буфер для пікселів
                buf[0] = newObj;
                bufCount = 1;
                isEmpty[i][n] = false;//видаляємо з існуючих
                 
                var objPixels = new Array();
                //доки в буфері є елементи
                while (bufCount > 0)
                {
                     
                    //перевіряємо сусідні пікселі, якщо вони чорні і існують - додаємо у буфер
                    if (metod == "all")
                    {
                        for (My = buf[0].Y - 1  ; My <= buf[0].Y + 1 ; My++)
                            for (Mx = buf[0].X - 1  ; Mx <= buf[0].X + 1 ; Mx++)
                                if (My >= 0 && My < H && Mx >= 0 && Mx < W && arr[My][Mx].R == 0 && isEmpty[My][Mx] == true) //якщо піксель в межах зображення і чорний і існує - записуємо його в буфер
                                {
                                    newObj2 = {};
                                    newObj2.X = Mx;
                                    newObj2.Y = My;
                                    buf[bufCount] = newObj2;
                                    bufCount++;
                                    isEmpty[My][Mx] = false;
                                }
                    }
                    else if (metod == "straight")
                    {

                    }
                    else if (metod == "diagonal")
                    {
 
                    }
                    

                     
                    //Записуємо поточний піксель і масив пікселей обєкта, видаляємо його з існуючих та з буфера
                    objPixels[objPixels.length] = buf[0];
                    //isEmpty[ buf[0].Y ][ buf[0].X ] = false;
                    for (m = 0; m < bufCount - 1; m++) buf[m] = buf[m + 1];
                    bufCount--;
                }

                //маючи масив пікселей обєкта: знаходимо maxX,minX,maxY,minY та все записюємо у масив обєктів
                maxX = objPixels[0].X;
                minX = objPixels[0].X;
                maxY = objPixels[0].Y;
                minY = objPixels[0].Y;
                for (a = 0; a < objPixels.length; a++)
                {
                    if (objPixels[a].X > maxX) maxX = objPixels[a].X;
                    if (objPixels[a].X < minX) minX = objPixels[a].X;
                    if (objPixels[a].Y > maxY) maxY = objPixels[a].Y;
                    if (objPixels[a].Y < minY) minY = objPixels[a].Y;
                }
                newObj2 = {};
                newObj2.left = minX;
                newObj2.right = maxX;
                newObj2.top = minY;
                newObj2.bottom = maxY;
                newObj2.obg = objPixels;
                findObjects[findObjects.length] = newObj2;
            }        

        }
    }

    /*document.write("Знайдені обєкти:");
    for (i = 0; i < findObjects.length; i++) {
        document.write("<br>Обєкт№" + (i + 1) + "<br>");
        document.write("<br>left=" + findObjects[i].left + " right=" + findObjects[i].right + " top=" + findObjects[i].top + " bottom=" + findObjects[i].bottom+"<br>");

        for (n = 0; n < findObjects[i].obg.length; n++) {
            
            document.write("(" + findObjects[i].obg[n].X + "," + findObjects[i].obg[n].Y + ")");
        }

    }*/
    
    /*document.write("Знайдені обєкти:");
    for (i = 0; i < findObjects.length; i++)
    {
        document.write("<br>Обєкт№" + (i + 1) + "<br>пікселі:");
        for (n = 0; n < findObjects[i].length; n++)
        {
            document.write("(" + findObjects[i][n].X + "," + findObjects[i][n].Y+")");
        }

    }*/

    return findObjects;
}


exports.segmentationArrayPixelscan = function (arr )
{
    let H = arr.length; 
    let W = arr[0].length;

    //створюємо масив показуючий наявність пікселя
    let isEmpty = new Array();
    for (i=0;i<H;i++)
    {
        let wr = [];
        for (n=0;n<W;n++) wr[n] = true;    
        isEmpty[i] = wr;
    }
    
    let findObjects = new Array();//масив для знайдених обєктів

    //тепер пройдемося по кажному пікселю зображення
    for (i = 0; i < H; i++)//згори до низу
    {
        for (n = 0; n < W; n++)//зліва на право
        {
            
            //якщо піксель не існує
            if (isEmpty[i][n] == false) { }
            //якщо піксель існує і він білий - пропускаємо, видаляючи піксель
            else if (isEmpty[i][n] == true && arr[i][n].R != 0)
            {
                //isEmpty[i][n] = false;
            }
            //якщо піксель існує і він чорного кольору - виявлено обєкт - починаємо виявляти всі його піксклі
            else if (isEmpty[i][n] == true && arr[i][n].R == 0)
            {
                //поміщаємо знайдений піксель у буфер та видаляємо його з існуючих
                var buf = new Array();//буфер для пікселів
                buf[0] = { X:n, Y:i }
                bufCount = 1;
                isEmpty[i][n] = false;//видаляємо з існуючих
                 
                var objPixels = new Array();
                //доки в буфері є елементи
                while (bufCount > 0)
                {           
                 
                    //перевіряємо сусідні пікселі, якщо вони чорні і існують - додаємо у буфер
                    for (My = buf[0].Y - 1  ; My <= buf[0].Y + 1 ; My++)
                        for (Mx = buf[0].X - 1  ; Mx <= buf[0].X + 1 ; Mx++)
                            if (My >= 0 && My < H && Mx >= 0 && Mx < W && arr[My][Mx].R == 0 && isEmpty[My][Mx] == true) //якщо піксель в межах зображення і чорний і існує - записуємо його в буфер
                            {
 
                                buf[bufCount] = { X:Mx, Y:My }
                                bufCount++;
                                isEmpty[My][Mx] = false;
                            }
              
                     
                    //Записуємо поточний піксель і масив пікселей обєкта, видаляємо його з існуючих та з буфера
                    objPixels[objPixels.length] = buf[0];
                 
                    for (m = 0; m < bufCount - 1; m++) buf[m] = buf[m + 1];
                    bufCount--;
                }




                //маючи масив пікселей обєкта: знаходимо maxX,minX,maxY,minY та все записюємо у масив обєктів
                maxX = objPixels[0].X;
                minX = objPixels[0].X;
                maxY = objPixels[0].Y;
                minY = objPixels[0].Y;
                for (a = 0; a < objPixels.length; a++)
                {
                    if (objPixels[a].X > maxX) maxX = objPixels[a].X;
                    if (objPixels[a].X < minX) minX = objPixels[a].X;
                    if (objPixels[a].Y > maxY) maxY = objPixels[a].Y;
                    if (objPixels[a].Y < minY) minY = objPixels[a].Y;
                }
                newObj2 = {};
                newObj2.left = minX;
                newObj2.right = maxX;
                newObj2.top = minY;
                newObj2.bottom = maxY;
                newObj2.obg = objPixels;
                findObjects[findObjects.length] = newObj2;
            }   

            //якщо піксель існує і він білий кольору - виявлено обєкт - починаємо виявляти всі його піксклі
            else if ( isEmpty[i][n] == true && arr[i][n].R != 0 )
            {
                //поміщаємо знайдений піксель у буфер та видаляємо його з існуючих
                let buf = new Array();//буфер для пікселів
                    buf[0] = { X:n, Y:i };
                bufCount = 1;
                isEmpty[i][n] = false;//видаляємо з існуючих
                 
                var objPixels = new Array();
                //доки в буфері є елементи
                while (bufCount > 0)
                {           
                 
                    //перевіряємо сусідні пікселі, якщо вони чорні і існують - додаємо у буфер
                    for (My = buf[0].Y - 1  ; My <= buf[0].Y + 1 ; My++)
                        for (Mx = buf[0].X - 1  ; Mx <= buf[0].X + 1 ; Mx++)
                            if (My >= 0 && My < H && Mx >= 0 && Mx < W && arr[My][Mx].R != 0 && isEmpty[My][Mx] == true) //якщо піксель в межах зображення і білий і існує - записуємо його в буфер
                            {
                                buf[bufCount] = { X:Mx, Y:My };
                                bufCount++;
                                isEmpty[My][Mx] = false;
                            }           
                     
                    //Записуємо поточний піксель і масив пікселей обєкта, видаляємо його з існуючих та з буфера
                    objPixels[objPixels.length] = buf[0];
                 
                    for (m = 0; m < bufCount - 1; m++) buf[m] = buf[m + 1];
                    bufCount--;
                }
          

                //маючи масив пікселей обєкта: знаходимо maxX,minX,maxY,minY та все записюємо у масив обєктів
                maxX = objPixels[0].X;
                minX = objPixels[0].X;
                maxY = objPixels[0].Y;
                minY = objPixels[0].Y;
                for (a = 0; a < objPixels.length; a++)
                {
                    if (objPixels[a].X > maxX) maxX = objPixels[a].X;
                    if (objPixels[a].X < minX) minX = objPixels[a].X;
                    if (objPixels[a].Y > maxY) maxY = objPixels[a].Y;
                    if (objPixels[a].Y < minY) minY = objPixels[a].Y;
                }
                newObj2 = {};
                newObj2.left = minX;
                newObj2.right = maxX;
                newObj2.top = minY;
                newObj2.bottom = maxY;
                newObj2.obg = objPixels;
                findObjects[findObjects.length] = newObj2;
            }        



        }
    }

 

    return findObjects;
}