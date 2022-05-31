const getDesign = ({subject, message})=>{
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Template</title>
        <style>
            *{
                margin: 0;
                padding: 0;
                font-family: sans-serif;
                font-weight: 400;
            }
            :root{
                --primary : #FA3D3D;
                --secondary : #EEF1FA;
            }
            .container{
                width: 600px;
    
            }
            .footer{
                background-color: var(--secondary);
                padding: 30px;
                color: #808080;
                font-size: 12px;
            }
            .flexit{
                display: flex;
                flex-direction: row;
                justify-content: space-between;
            }
            .social > a > img:hover {
                background-color: #fff;
                border-radius: 5px;
                box-shadow: 0px 2px 0px rgba(0, 0, 0, .05);
            }
            .flexit > .address{
                width: 300px;
                font-size: 12px;
            }
            .social > a > img{
                padding: 10px;
            }
            a{
                text-decoration: none;
                color: var(--primary);
                margin-left: 20px;
            }
            .contact{
                float: right;
                font-size: 12px;
            }
            .unsubscribe {
                opacity: 0.5;
            }
            .header{
                height: 50px;
                background-color: var(--primary);
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                display: flex;
                flex-direction: row;
                justify-content: center;
            }
            h3.display {
                font-size: 16px;
                font-weight: bold;
            }
            section{
                padding: 30px;
            }
            div.body p{
                font-size: 14px;
            }
            button{
                appearance: none;
                -webkit-appearance: none;
                -moz-appearance: none;
                border: none;
                border-radius: 5px;
                color: #ffffff;
                padding: 10px 20px;
                font-size: 14px;
                background-color: var(--primary);
                cursor:pointer;
                box-shadow: 0px 2px 0px rgba(0, 0, 0, .05);
            }
            button:hover{
                background-color: #d63232;
            }
    
        </style>
    </head>
    <body>
        <div class="container">
            <section class="header">
                &nbsp;
            </section>
    
            <section class="main">
                <h3 class="display">
                    ${subject}
                </h3>
                <hr style="margin-top: 20px; margin-bottom: 20px; border-color: var(--secondary);">
    
                <div class="body">
                    
                    <p style="margin-top: 20px;">
                        ${message}
                    </p>
    
                </div>
    
    
            </section>
    
            <section class="footer">
                <div class="flexit" style="margin-bottom: 20px;">
                    <div class="address">
                        &nbsp;
                    </div>
                    <div>
                        <div class="social">
                            <a href="#" target="_blank">
                                <img height="18px" width="auto" src="https://www.apptide.io/wp-content/uploads/2021/08/instagram.png" alt="">
                            </a>
    
                            <a href="#">
                                <img height="18px" width="auto" src="https://www.apptide.io/wp-content/uploads/2021/08/twitter.png" alt="">
                            </a>
                        </div>
                        <div class="contact" style="margin-top: 20px;">
                            
                            &nbsp;
                        </div>
                    </div>
                </div>
    
                <div class="flexit">
                    <div class="copyright">
                        (c) Copyright 2021
                    </div>
                    <div class="unsubscribe">
                        <a href="#">...</a>
                    </div>
                </div>
            </section>
        </div>
    </body>
    </html>
    
    `;
}

module.exports = {getDesign}