var getFormWithName = function (name) {
  var formsCollection = document.getElementsByTagName("form");
  for(var i=0;i<formsCollection.length;i++)
  {
     if (formsCollection[i].name === name) {
        return formsCollection[i];
     }
  }
  return null;
};
var getInputsWithName = function (name) {
  var res = [];
  var collection = document.getElementsByTagName("input");
  for(var i=0;i<collection.length;i++)
  {
     if (collection[i].name === name) {
        res.push(collection[i]);
     }
  }
  return res;
};
var formSubmit = function (url, method, form, cb) {
    var xhr = new XMLHttpRequest();
    xhr.open(method, url);
    xhr.onload = function(event) {
        cb(JSON.parse(event.target.response));
    };
    var formData = new FormData(form); 
    xhr.send(formData);
};
var skipcash = {
    sdk: {
        defaults: {
            btnInnerHtml: 'Pay with ',
            btnHmlAfterLogo: 'SkipCash',
            sandBoxUrl: 'https://skipcashtest.azurewebsites.net/',
            productionUrl: 'https://api.skipcash.app/',
            environment: 'sandbox',
            onError: function (message) { console.log(message); }
        },

        // options:
        // container - element ID where skipcash button should be generated
        // clientId - ID assigned to the client by SkipCash
        // btnInnerHTML - inner HTML of rendered button
        // btnStyle - object with CSS styles for rendered button
        // btnHoverStyle - object with CSS styles for rendered button - on hover
        // logoImgStyle - object with CSS styles for skipcash logo in rendered button
        // logoImgHoverStyle - object with CSS styles for skipcash logo in rendered button - on hover
        // environment - sandbox or production (default is sandbox) - specifies used URL
        // onCreatePayment - callback function when button is clicked - should return promise with ID of transaction
        // onSuccess - callback function when payment is successfuly finished
        // onCancel - callback function when payment window is closed without paying
        // onError(message) - error callback function
        create: function (options) {
            var constants = {
                'payUrl': 'pay/',
                'logoImgSrc': 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI1M3B4IiB2aWV3Qm94PSIwIDAgNDAgNTMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYyICg5MTM5MCkgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+U2tpcENhc2hfbG9nb19iaWdAM3g8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iU2tpcENhc2hfbG9nb19iaWciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgICAgIDxwYXRoIGQ9Ik0yNS42ODY1ODY2LDIwLjg5NjgzNDYgTDIyLjgyNTg4ODgsMTguMjE5MTg1OSBDMjIuODIwMTQ5MSwxOC4yMTM4MTM0IDIyLjgxMjExMzQsMTguMjEyNzM4OSAyMi44MDYzNzM2LDE4LjIwNzM2NjQgTDIxLjIxMDcxOTYsMTYuNzE0ODg4OSBMMzQuNjc5NjQ3LDQuMTA3ODA1MzYgQzM1LjQyOTI2LDMuNDA2MTU4MjUgMzUuNjQyNzc5MiwyLjQwMTUwMjc0IDM1LjIzNzU1MTksMS40ODYwMzA1NiBDMzQuODMxMTc2NywwLjU2OTQ4Mzg3MiAzMy45MjE5OTgzLDAgMzIuODYyNDM4MSwwIEwxOC40NjcxMTMsMCBDMTcuNDkyNTAxMiwwLjAwMTA3NDQ5Nzg3IDE2LjU0NDI5MjQsMC4xODY5NjI2MyAxNS42NDg4ODk0LDAuNTUyMjkxOTA2IEMxNS42MjkzNzQyLDAuNTYwODg3ODg5IDE1LjYxNDQ1MDgsMC41NzU5MzA4NTkgMTUuNTk2MDgzNiwwLjU4NDUyNjg0MiBDMTUuNTc3NzE2NCwwLjU5MzEyMjgyNSAxNS41NTcwNTMyLDAuNTk0MTk3MzIzIDE1LjUzODY4NiwwLjYwMzg2NzgwNCBMMTQuNDA0NTA4OCwxLjIwOTg4NDYgQzE0LjM3Njk1OCwxLjIyNDkyNzU3IDE0LjM0OTQwNzEsMS4yNDEwNDUwNCAxNC4zMjE4NTYzLDEuMjU5MzExNTEgQzE0LjIzMjMxNiwxLjMyMDU1Nzg4IDE0LjE0OTY2MzQsMS4zODcxNzY3NSAxNC4wNjgxNTg3LDEuNDU1OTQ0NjIgTDEzLjg4NDQ4NjMsMS42MDEwMDE4MyBDMTMuNzQwOTkyMywxLjcwODQ1MTYyIDEzLjU5ODY0NjEsMS44MTgwNTA0IDEzLjQ3MDA3NTUsMS45MzgzOTQxNiBMMS42MzEyNDA3LDEzLjAxODYxNjIgQy0wLjU0NDEyOTQsMTUuMDU2OTM4NyAtMC41NDQxMjk0LDE4LjM3MjgzOTEgMS42MzM1MzY2MSwyMC40MTExNjE2IEwxMy45NzQwMjY2LDMxLjg5MzI0NTggQzEzLjk3ODYxODQsMzEuODk3NTQzOCAxMy45ODMyMTAzLDMxLjkwMTg0MTggMTMuOTg3ODAyMSwzMS45MDYxMzk4IEwxNi44MzI0Mjg1LDM0LjU2NzY3MSBDMTYuODQxNjEyMSwzNC41NzYyNjcgMTYuODUzMDkxNywzNC41Nzg0MTYgMTYuODYyMjc1MywzNC41ODU5Mzc1IEwxOC40NDMwMDU5LDM2LjA3MTk2OCBMNC45NzE3ODI2NSw0OC42ODEyMDA2IEM0LjIyMjE2OTYzLDQ5LjM4MTc3MzIgNC4wMDg2NTA0NSw1MC4zODY0Mjg3IDQuNDEzODc3NzEsNTEuMzAyOTc1NCBDNC44MTkxMDQ5Niw1Mi4yMTk1MjIxIDUuNzI5NDMxMzQsNTIuNzg3OTMxNCA2Ljc4ODk5MTU2LDUyLjc4NzkzMTQgTDIxLjE4NDMxNjcsNTIuNzg3OTMxNCBDMjIuMTYyMzcyMiw1Mi43ODY4NTY5IDIzLjExMjg3Nyw1Mi41OTk4OTQzIDI0LjAxMDU3NTksNTIuMjMyNDE2IEMyNC4wMjU0OTkyLDUyLjIyNTk2OSAyNC4wMzY5Nzg4LDUyLjIxNDE0OTYgMjQuMDUxOTAyMiw1Mi4yMDc3MDI2IEMyNC4wNzcxNTcxLDUyLjE5Njk1NzYgMjQuMTAzNTYsNTIuMTkxNTg1MSAyNC4xMjg4MTUsNTIuMTc4NjkxMSBMMjUuMjQxMTgxLDUxLjU4MzQxOTMgQzI1LjI3OTA2MzQsNTEuNTY0MDc4NCAyNS4zMjYxMjk1LDUxLjUzMTg0MzQgMjUuMzYwNTY4MSw1MS41MDcxMyBDMjUuNDM4NjI4OSw1MS40NTQ0Nzk2IDI1LjUxMDk0OTksNTEuMzk1MzgyMiAyNS42NTEwMDAxLDUxLjI3OTMzNjQgTDI1Ljc0OTcyNCw1MS4yMDQxMjE2IEMyNS45MDEyNTM3LDUxLjA5MDIyNDggMjYuMDUxNjM1NSw1MC45NzUyNTM1IDI2LjE4NzA5MzksNTAuODQ4NDYyOCBMMzguMDI1OTI4NywzOS43NjgyNDA3IEM0MC4yMDI0NDY3LDM3LjcyOTkxODMgNDAuMjAxMjk4OCwzNC40MTQwMTc4IDM4LjAyMzYzMjgsMzIuMzc1Njk1NCBMMjUuNjg2NTg2NiwyMC44OTY4MzQ2IFogTTIxLjM2Nzk4OTEsMzMuMjU3ODU4MSBDMjEuMTQxODQyNCwzMy41MTM1ODg2IDIwLjkwNDIxNjIsMzMuNzYxNzk3NiAyMC42NTM5NjI2LDM0LjAwMjQ4NTEgTDE5Ljc1NzQxMTYsMzQuODQwNTkzNSBMMTguMDU5NTg5OCwzMy4yNDM4ODk2IEMxNi4wNzM2MzE5LDMxLjM0OTU0OTkgMTUuMTI1NDIzLDI4Ljc3MDc1NSAxNS4zODYwMDgzLDI1Ljk4NjczMSBDMTUuNDQ5MTQ1NywyNS4zMTk0Njc4IDE1LjU3NzcxNjQsMjQuNjU4NjUxNyAxNS43NjcxMjg1LDI0LjAxMDcyOTQgQzE1LjkzMjQzMzcsMjMuNDUwOTE2IDE2LjE1MTY5MjYsMjIuOTAzOTk2NiAxNi40MDUzOTAyLDIyLjM2ODg5NjcgQzE2LjQ0NTU2ODUsMjIuMjg0MDExNCAxNi40Nzc3MTEyLDIyLjE5ODA1MTUgMTYuNTIwMTg1NCwyMi4xMTQyNDA3IEMxNy4xNDAwNzk4LDIwLjg4NzE2NDEgMTcuOTkxODYwNiwxOS43NDI4MjM5IDE5LjA0NDUzMzEsMTguNzQxMzkxOSBMMTkuODk3NDYxOCwxNy45NDYyNjM0IEwyMS41NjU0MzY5LDE5LjUwNzUwODkgQzIzLjU3NDM1MzksMjEuNDA2MTQ2NiAyNC41MzUxOTAyLDIzLjk5NTY4NjUgMjQuMjcwMDEzMSwyNi44MDAxMjU5IEMyNC4wNTMwNTAxLDI5LjExNTY2ODggMjMuMDQwNTU2LDMxLjM2NTY2NzQgMjEuMzY3OTg5MSwzMy4yNTc4NTgxIEwyMS4zNjc5ODkxLDMzLjI1Nzg1ODEgWiBNMTguNDY3MTEzLDEuNzQwNjg2NTUgTDMyLjg2MjQzODEsMS43NDA2ODY1NSBDMzMuMzAzMjUxOCwxLjc0MDY4NjU1IDMzLjQ3NjU5MjcsMi4wNTU1MTQ0MyAzMy41MTkwNjY5LDIuMTUyMjE5MjQgQzMzLjU2MTU0MTIsMi4yNDc4NDk1NSAzMy42NzYzMzY0LDIuNTg1MjQxODggMzMuMzY1MjQxMywyLjg3NjQzMDggTDE5Ljg5NjMxMzksMTUuNDgzNTE0MyBMMTkuMDY4NjQwMSwxNC43MDg4MDE0IEwxOS4wNjUxOTYyLDE0LjcwNTU3NzkgQzE2Ljk5MTk5MzksMTIuNzM2MDIzMyAxNS43NDY0NjU0LDEwLjE5MjY4NjggMTUuNTU1OTA1Myw3LjU0MTkwMDU2IEMxNS41NDU1NzM3LDcuMzk0Njk0MzUgMTUuNTM3NTM4LDcuMjMwMjk2MTggMTUuNTMyOTQ2Miw3LjA1MDg1NTAzIEMxNS41MzI5NDYyLDcuMDIzOTkyNTkgMTUuNTM0MDk0Miw2Ljk5MDY4MzE1IDE1LjUzMjk0NjIsNi45NjM4MjA3IEMxNS41MzA2NTAzLDYuODA1ODY5NTIgMTUuNTI5NTAyMyw2LjY0MjU0NTg0IDE1LjUzNTI0MjEsNi40NjUyNTM2OSBDMTUuNTM1MjQyMSw2LjQ1MDIxMDcyIDE1LjUzNjM5MDEsNi40MzQwOTMyNSAxNS41Mzc1MzgsNi40MTkwNTAyOCBDMTUuNTY1MDg4OSw1LjU5MTY4NjkyIDE1LjY5MjUxMTYsNC41NzE5ODg0NCAxNi4wNTI5Njg3LDMuNDk1MzQxNTggQzE2LjA1NDExNjcsMy40ODg4OTQ1OSAxNi4wNTc1NjA1LDMuNDgyNDQ3NiAxNi4wNTk4NTY0LDMuNDc2MDAwNjEgQzE2LjE0NDgwNDksMy4yMjI0MTkxMiAxNi4yNDQ2NzY4LDIuOTY2Njg4NjIgMTYuMzU3MTc2MSwyLjcwODgwOTEzIEMxNi4zOTI3NjI3LDIuNjI4MjIxNzkgMTYuNDM2Mzg0OSwyLjU0NzYzNDQ1IDE2LjQ3NDI2NzMsMi40NjU5NzI2MSBDMTYuNTQxOTk2NSwyLjMyMzA2NDQgMTYuNjE1NDY1NSwyLjE4MDE1NjE4IDE2LjY5MjM3ODMsMi4wMzYxNzM0NyBDMTcuMjYyOTEwNywxLjg0MTY4OTM1IDE3Ljg1ODY5ODEsMS43NDE3NjEwNSAxOC40NjcxMTMsMS43NDA2ODY1NSBMMTguNDY3MTEzLDEuNzQwNjg2NTUgWiBNMi45NDc5NDIyOSwxOS4xNzk3ODcgQzEuNDk1NzgyMywxNy44MjA1NDcyIDEuNDk1NzgyMywxNS42MDkyMzA2IDIuOTQ2Nzk0MzQsMTQuMjQ4OTE2MyBMMTQuMDA4NDY1MiwzLjg5NjEyOTI4IEMxMy45OTIzOTM5LDMuOTYyNzQ4MTUgMTMuOTg2NjU0MSw0LjAyMzk5NDUzIDEzLjk3MTczMDcsNC4wOTA2MTM0IEMxMy45MDk3NDEzLDQuMzY1Njg0ODUgMTMuODU2OTM1NSw0LjYzNTM4MzgyIDEzLjgxNjc1NzEsNC44OTc1NjEzIEMxMy43OTk1Mzc4LDUuMDE1NzU2MDYgMTMuNzg2OTEwNCw1LjEyNzUwMzg0IDEzLjc3MTk4Nyw1LjI0MzU0OTYxIEMxMy43NDU1ODQxLDUuNDU3Mzc0NjkgMTMuNzIzNzczLDUuNjYzNjc4MjggMTMuNzA5OTk3NSw1Ljg2MzUzNDg4IEMxMy43MDE5NjE5LDUuOTc0MjA4MTcgMTMuNjkzOTI2Miw2LjA4MDU4MzQ1IDEzLjY4OTMzNDQsNi4xODY5NTg3NCBDMTMuNjgwMTUwOCw2LjM4NjgxNTM1IDEzLjY3NTU1OSw2LjU3Mzc3Nzk4IDEzLjY3NTU1OSw2Ljc1NTM2ODEyIEMxMy42NzU1NTksNi44MzU5NTU0NiAxMy42NzMyNjMxLDYuOTE3NjE3MyAxMy42NzQ0MTEsNi45OTI4MzIxNSBDMTMuNjc3ODU0OSw3LjIzNjc0MzE2IDEzLjY4NzAzODUsNy40NjIzODc3MiAxMy43MDA4MTM5LDcuNjU3OTQ2MzMgQzEzLjkxNzc3NywxMC42OTQ0NzczIDE1LjMyNzQ2MjcsMTMuNjA0MjE3NiAxNy43MDk0NjQzLDE1Ljg5NjEyOTMgQzE3LjcyNDM4NzYsMTUuOTExMTY0NSAxNy43MzgxNjMxLDE1LjkyNjIwNzUgMTcuNzUzMDg2NSwxNS45MzkxMDE0IEwxOC41ODE5MDgyLDE2LjcxNTk2MzQgTDE3LjcyNTUzNTYsMTcuNTE1Mzg5OCBDMTUuMzExMzkxNCwxOS44MDk0NDI4IDEzLjgyMjQ5NjksMjIuNzY0MzExOSAxMy41MzQzNjA4LDI1LjgzNDE1MjMgQzEzLjQ5OTkyMjIsMjYuMjAyNzA1MSAxMy40ODk1OTA2LDI2LjU2NTg4NTQgMTMuNDkwNzM4NiwyNi45Mjc5OTEyIEMxMy40OTA3Mzg2LDI3LjAyNzkxOTUgMTMuNDk0MTgyNSwyNy4xMjY3NzMzIDEzLjQ5NjQ3ODQsMjcuMjI2NzAxNiBDMTMuNTA1NjYyLDI3LjUxODk2NSAxMy41MjYzMjUxLDI3LjgwOTA3OTQgMTMuNTU4NDY3OCwyOC4wOTU5NzAzIEMxMy41NjY1MDM1LDI4LjE2Nzk2MTcgMTMuNTcxMDk1MywyOC4yNDIxMDIxIDEzLjU4MDI3ODksMjguMzE0MDkzNCBDMTMuNjIxNjA1MiwyOC42MjI0NzQzIDEzLjY3MjExNTEsMjguOTI3NjMxNyAxMy43Mzk4NDQzLDI5LjIyODQ5MTEgTDIuOTQ3OTQyMjksMTkuMTc5Nzg3IFogTTIxLjE4MzE2ODcsNTEuMDQ3MjQ0OSBMNi43ODg5OTE1Niw1MS4wNDcyNDQ5IEM2LjM0ODE3Nzc3LDUxLjA0NzI0NDkgNi4xNzQ4MzY5NCw1MC43MzI0MTcgNi4xMzIzNjI2OSw1MC42MzY3ODY3IEM2LjA4OTg4ODQ1LDUwLjU0MDA4MTkgNS45NzUwOTMxOSw1MC4yMDM3NjQgNi4yODYxODgzMyw0OS45MTE1MDA2IEwxOS43NTg1NTk2LDM3LjMwMTE5MzYgTDIwLjU4NTA4NTQsMzguMDc1OTA2NiBDMjAuNTkxOTczMSwzOC4wODEyNzkxIDIwLjU5NzcxMjksMzguMDg1NTc3MSAyMC42MDM0NTI3LDM4LjA5MjAyNCBDMjIuNjY5NzY3Myw0MC4wNTk0Mjk2IDIzLjkxMTg1MTksNDIuNTk5NTQyNiAyNC4xMDEyNjQxLDQ1LjI0NDk1NjQgQzI0LjExMTU5NTcsNDUuMzkzMjM3MSAyNC4xMTk2MzE0LDQ1LjU1ODcwOTcgMjQuMTI0MjIzMiw0NS43MzgxNTA5IEMyNC4xMjY1MTkxLDQ1LjgxMTIxNjcgMjQuMTI0MjIzMiw0NS44OTcxNzY2IDI0LjEyNDIyMzIsNDUuOTc1NjE0OSBDMjQuMTI0MjIzMiw0Ni4wODYyODgyIDI0LjEyNjUxOTEsNDYuMTkyNjYzNSAyNC4xMjMwNzUyLDQ2LjMxMTkzMjggQzI0LjExOTYzMTQsNDYuNDU4MDY0NSAyNC4xMDgxNTE4LDQ2LjYxNjAxNTcgMjQuMDk3ODIwMyw0Ni43NzM5NjY4IEMyNC4wOTQzNzY0LDQ2LjgzMzA2NDIgMjQuMDkyMDgwNSw0Ni44ODc4NjM2IDI0LjA4NzQ4ODcsNDYuOTQ5MTEgQzI0LjA2OTEyMTQsNDcuMTYxODYwNiAyNC4wNDM4NjY1LDQ3LjM4NDI4MTYgMjQuMDA5NDI3OSw0Ny42MTMxNDk3IEMyNC4wMDgyOCw0Ny42MjE3NDU3IDI0LjAwNzEzMiw0Ny42MzAzNDE2IDI0LjAwNTk4NDEsNDcuNjM4OTM3NiBDMjMuODk4MDc2NSw0OC4zNTQ1NTMyIDIzLjcwMTc3NjYsNDkuMTM1NzEzMiAyMy4zNzExNjYzLDQ5LjkyNDM5NDYgQzIzLjM2NzcyMjQsNDkuOTM1MTM5NiAyMy4zNjMxMzA2LDQ5Ljk0NDgxMDEgMjMuMzU5Njg2OCw0OS45NTU1NTUgQzIzLjI2ODk5ODUsNTAuMTY4MzA1NiAyMy4xNjIyMzg5LDUwLjM3OTk4MTcgMjMuMDUyMDM1NSw1MC41OTE2NTc4IEMyMy4wMjQ0ODQ2LDUwLjY0NDMwODIgMjIuOTk5MjI5Nyw1MC42OTY5NTg2IDIyLjk2OTM4MjksNTAuNzQ4NTM0NSBDMjIuMzk2NTU0Niw1MC45NDYyNDIxIDIxLjc5NzMyMzMsNTEuMDQ3MjQ0OSAyMS4xODMxNjg3LDUxLjA0NzI0NDkgTDIxLjE4MzE2ODcsNTEuMDQ3MjQ0OSBaIE0zNi43MTAzNzUsMzguNTM3OTQwNyBMMjUuNjQ4NzA0Miw0OC44OTA3Mjc2IEMyNS42NjQ3NzU1LDQ4LjgyNDEwODggMjUuNjcxNjYzMiw0OC43NjE3ODc5IDI1LjY4NjU4NjYsNDguNjk1MTY5IEMyNS43NDc0MjgxLDQ4LjQyMDA5NzYgMjUuODAwMjMzOSw0OC4xNTE0NzMxIDI1Ljg0MDQxMjIsNDcuODkwMzcwMSBDMjUuODU4Nzc5NSw0Ny43NzExMDA5IDI1Ljg3MTQwNyw0Ny42NTgyNzg2IDI1Ljg4NTE4MjQsNDcuNTQyMjMyOCBDMjUuOTExNTg1Myw0Ny4zMjg0MDc3IDI1LjkzMzM5NjQsNDcuMTIzMTc4NyAyNS45NDgzMTk4LDQ2LjkyMzMyMiBDMjUuOTU1MjA3NSw0Ni44MTI2NDg4IDI1Ljk2MzI0MzIsNDYuNzA2MjczNSAyNS45Njc4MzUsNDYuNTk5ODk4MiBDMjUuOTc3MDE4Niw0Ni40MDAwNDE2IDI1Ljk4MTYxMDQsNDYuMjE0MTUzNSAyNS45ODE2MTA0LDQ2LjAzMzYzNzggQzI1Ljk4Mjc1ODQsNDUuOTUxOTc2IDI1Ljk4NTA1NDMsNDUuODY5MjM5NiAyNS45ODI3NTg0LDQ1Ljc5Mjk1MDMgQzI1Ljk3OTMxNDUsNDUuNTUwMTEzOCAyNS45NzAxMzA5LDQ1LjMyMzM5NDcgMjUuOTU2MzU1NSw0NS4xMjg5MTA2IEMyNS43MzkzOTI0LDQyLjA5MjM3OTYgMjQuMzMwODU0NiwzOS4xODI2Mzk0IDIxLjk0NzcwNTEsMzYuODkwNzM1NCBDMjEuOTE3ODU4MywzNi44NTk1NzUgMjEuODg0NTY3NywzNi44Mjk0ODkgMjEuODUwMTI5MSwzNi44MDE1NTIxIEwyMS44NTI0MjUxLDM2Ljc5OTQwMzEgTDIxLjA3NDExMzIsMzYuMDcwODkzNSBMMjEuOTc2NDAzOSwzNS4yMjUyNjM3IEMyNC4zNjQxNDUzLDMyLjkzNzY1NzggMjUuODM2OTY4NCwyOS45OTg5MDYxIDI2LjEyMjgwODYsMjYuOTUyNzA0NiBDMjYuMTU4Mzk1MSwyNi41ODIwMDI4IDI2LjE2NzU3ODcsMjYuMjE1NTk5MSAyNi4xNjY0MzA4LDI1Ljg1MTM0NDMgQzI2LjE2NjQzMDgsMjUuNzUyNDkwNSAyNi4xNjI5ODY5LDI1LjY1NTc4NTcgMjYuMTYwNjkxLDI1LjU1ODAwNjQgQzI2LjE1MTUwNzQsMjUuMjUzOTIzNSAyNi4xMzA4NDQyLDI0Ljk1NDEzODYgMjYuMDk2NDA1NywyNC42NTY1MDI3IEMyNi4wODk1MTgsMjQuNTk0MTgxOCAyNi4wODYwNzQxLDI0LjUyOTcxMTkgMjYuMDc4MDM4NCwyNC40NjczOTEgQzI2LjAzNjcxMjEsMjQuMTYxMTU5MSAyNS45ODYyMDIyLDIzLjg1ODE1MDcgMjUuOTE5NjIxLDIzLjU2MDUxNDggTDM2LjcwOTIyNzEsMzMuNjA3MDY5OSBDMzguMTYxMzg3MSwzNC45NjYzMDk3IDM4LjE2MTM4NzEsMzcuMTc3NjI2NCAzNi43MTAzNzUsMzguNTM3OTQwNyBMMzYuNzEwMzc1LDM4LjUzNzk0MDcgWiIgaWQ9IkZpbGwtMSIgZmlsbD0iI0ZGRkZGRiI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMjUuMjUwNjYwMiw0NC4xNzQyMTkyIEMyNS4wNDA3MDgyLDQxLjIzMDE5MjMgMjMuMzU3OTI0NCwzOS4yNTM4OTUyIDIxLjA3NDExMzIsMzcuMDY5Nzk0NiBMMTkuMTEyNzYzNiwzNS4zNzAxNTM3IEw0Ljk3MTc4MjY1LDQ4LjY4MTIwMDYgQzMuNTkyNzk5NjMsNDkuOTc5OTQ5NSAzLjkxNTAyNDI1LDUyLjc4NzkzMTQgNi43ODg5OTE1Niw1Mi43ODc5MzE0IEwyMS4yMTQyNDUyLDUyLjc4NzkzMTQgQzIyLjYwNTc4Nyw1Mi43ODc5MzE0IDIzLjU3NjExOTgsNTIuNTA1NjEzIDI0LjEyNTI0MzYsNTEuOTQwOTc2MiBDMjUuNDIxMTE0LDQ5LjczODE3OTggMjUuNDYwNjEyMiw0Ny4xMTgyNDYyIDI1LjI1MDY2MDIsNDQuMTc0MjE5MiBaIiBpZD0iRmlsbC0yMiI+PC9wYXRoPgogICAgICAgICAgICA8cGF0aCBkPSJNMTkuMTEyNzYzNiwzNS4zNzAxNTM3IEwyMS4wNzQxMTMyLDM3LjA2OTc5NDYgQzIxLjA3NTI3OTYsMzcuMDcxOTk0MSAyNC45NzM3OTA0LDQwLjE2NjcwNTMgMjUuMzQ2MzUyMiw0NC43NDQzODEyIEMyNS40OTEzNzk3LDQ2LjUyNjMzNzMgMjUuMTU5NTY3Myw0OS45NzMyNzI2IDIzLjg1MDg2NjUsNTIuMTgzNzY3MiBDMjQuODc2MzA4LDUxLjY5NDc4ODYgMjUuNjk5MDM5Myw1MS4xODgzMDUyIDI2LjMxOTA2MDMsNTAuNjY0MzE2OSBMMzguNDE5MDY1OSwzOS4zNzYzNjA5IEM0MC4yNzM2NDE5LDM3LjYyNjY2MDkgMzkuNjkwMjU5MiwzMy45MjYxNDM3IDM3LjgzNDUxNjgsMzIuMTc3NTQzNSBMMzEuOTc5MTg4OCwyNi42NTU3MDU5IEwyMS4yMTA3MTk2LDE2LjcxNDg4ODkgQzIzLjUwNjE5NDgsMTguODYzNzk3NiAyNC42MTE4NTYxLDIyLjU2MTQ0MSAyNC4zMTMyNTc3LDI1Ljc1NTExMDkgQzI0LjAzNjgyMDksMjguNzEyMzM0OCAyMy40MzAzNjU5LDMwLjkzNTAzMzEgMjEuMjEwNzE5NiwzMy40MjA2NTEzIEwxOS4xMTI3NjM2LDM1LjM3MDE1MzcgWiIgaWQ9IkZpbGwtMTAiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg=='
            }
            var defaultBtnStyle = {
                'position': 'relative',
                'display': 'block',
                'border-radius': '15px',
                'padding': '5px',
                'background-color': '#007DFA',
                'border': '3px solid #007DFA',
                'color': '#FFFFFF',
                'text-decoration': 'none',
                'text-align': 'center',
                'box-sizing': 'border-box'
            };
            var defaultBtnHoverStyle = {
                'background-color': '#0075e9',
                'color': '#FFFFFF',
                'text-decoration': 'none',
                //'font-weight': 'bold'
            };
            var defaultImgStyle = {
                'position': 'relative',
                'top': '0px',
                'border-radius': '5px',
                'background-color': 'transparent',
                'height': '22px',
                'margin-left': '15px',
                'margin-right': '5px',
                'vertical-align': 'baseline'
            };
            var defaultImgHoverStyle = {
                //'content': 'url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iNDBweCIgaGVpZ2h0PSI1M3B4IiB2aWV3Qm94PSIwIDAgNDAgNTMiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDYyICg5MTM5MCkgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+U2tpcENhc2hfbG9nb19iaWdAM3g8L3RpdGxlPgogICAgPGRlc2M+Q3JlYXRlZCB3aXRoIFNrZXRjaC48L2Rlc2M+CiAgICA8ZyBpZD0iU2tpcENhc2hfbG9nb19iaWciIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJHcm91cCI+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0iIzAwN0RGQSIgZD0iTTI1LjY4NjU4NjYsMjAuODk2ODM0NiBMMjIuODI1ODg4OCwxOC4yMTkxODU5IEMyMi44MjAxNDkxLDE4LjIxMzgxMzQgMjIuODEyMTEzNCwxOC4yMTI3Mzg5IDIyLjgwNjM3MzYsMTguMjA3MzY2NCBMMjEuMjEwNzE5NiwxNi43MTQ4ODg5IEwzNC42Nzk2NDcsNC4xMDc4MDUzNiBDMzUuNDI5MjYsMy40MDYxNTgyNSAzNS42NDI3NzkyLDIuNDAxNTAyNzQgMzUuMjM3NTUxOSwxLjQ4NjAzMDU2IEMzNC44MzExNzY3LDAuNTY5NDgzODcyIDMzLjkyMTk5ODMsMCAzMi44NjI0MzgxLDAgTDE4LjQ2NzExMywwIEMxNy40OTI1MDEyLDAuMDAxMDc0NDk3ODcgMTYuNTQ0MjkyNCwwLjE4Njk2MjYzIDE1LjY0ODg4OTQsMC41NTIyOTE5MDYgQzE1LjYyOTM3NDIsMC41NjA4ODc4ODkgMTUuNjE0NDUwOCwwLjU3NTkzMDg1OSAxNS41OTYwODM2LDAuNTg0NTI2ODQyIEMxNS41Nzc3MTY0LDAuNTkzMTIyODI1IDE1LjU1NzA1MzIsMC41OTQxOTczMjMgMTUuNTM4Njg2LDAuNjAzODY3ODA0IEwxNC40MDQ1MDg4LDEuMjA5ODg0NiBDMTQuMzc2OTU4LDEuMjI0OTI3NTcgMTQuMzQ5NDA3MSwxLjI0MTA0NTA0IDE0LjMyMTg1NjMsMS4yNTkzMTE1MSBDMTQuMjMyMzE2LDEuMzIwNTU3ODggMTQuMTQ5NjYzNCwxLjM4NzE3Njc1IDE0LjA2ODE1ODcsMS40NTU5NDQ2MiBMMTMuODg0NDg2MywxLjYwMTAwMTgzIEMxMy43NDA5OTIzLDEuNzA4NDUxNjIgMTMuNTk4NjQ2MSwxLjgxODA1MDQgMTMuNDcwMDc1NSwxLjkzODM5NDE2IEwxLjYzMTI0MDcsMTMuMDE4NjE2MiBDLTAuNTQ0MTI5NCwxNS4wNTY5Mzg3IC0wLjU0NDEyOTQsMTguMzcyODM5MSAxLjYzMzUzNjYxLDIwLjQxMTE2MTYgTDEzLjk3NDAyNjYsMzEuODkzMjQ1OCBDMTMuOTc4NjE4NCwzMS44OTc1NDM4IDEzLjk4MzIxMDMsMzEuOTAxODQxOCAxMy45ODc4MDIxLDMxLjkwNjEzOTggTDE2LjgzMjQyODUsMzQuNTY3NjcxIEMxNi44NDE2MTIxLDM0LjU3NjI2NyAxNi44NTMwOTE3LDM0LjU3ODQxNiAxNi44NjIyNzUzLDM0LjU4NTkzNzUgTDE4LjQ0MzAwNTksMzYuMDcxOTY4IEw0Ljk3MTc4MjY1LDQ4LjY4MTIwMDYgQzQuMjIyMTY5NjMsNDkuMzgxNzczMiA0LjAwODY1MDQ1LDUwLjM4NjQyODcgNC40MTM4Nzc3MSw1MS4zMDI5NzU0IEM0LjgxOTEwNDk2LDUyLjIxOTUyMjEgNS43Mjk0MzEzNCw1Mi43ODc5MzE0IDYuNzg4OTkxNTYsNTIuNzg3OTMxNCBMMjEuMTg0MzE2Nyw1Mi43ODc5MzE0IEMyMi4xNjIzNzIyLDUyLjc4Njg1NjkgMjMuMTEyODc3LDUyLjU5OTg5NDMgMjQuMDEwNTc1OSw1Mi4yMzI0MTYgQzI0LjAyNTQ5OTIsNTIuMjI1OTY5IDI0LjAzNjk3ODgsNTIuMjE0MTQ5NiAyNC4wNTE5MDIyLDUyLjIwNzcwMjYgQzI0LjA3NzE1NzEsNTIuMTk2OTU3NiAyNC4xMDM1Niw1Mi4xOTE1ODUxIDI0LjEyODgxNSw1Mi4xNzg2OTExIEwyNS4yNDExODEsNTEuNTgzNDE5MyBDMjUuMjc5MDYzNCw1MS41NjQwNzg0IDI1LjMyNjEyOTUsNTEuNTMxODQzNCAyNS4zNjA1NjgxLDUxLjUwNzEzIEMyNS40Mzg2Mjg5LDUxLjQ1NDQ3OTYgMjUuNTEwOTQ5OSw1MS4zOTUzODIyIDI1LjY1MTAwMDEsNTEuMjc5MzM2NCBMMjUuNzQ5NzI0LDUxLjIwNDEyMTYgQzI1LjkwMTI1MzcsNTEuMDkwMjI0OCAyNi4wNTE2MzU1LDUwLjk3NTI1MzUgMjYuMTg3MDkzOSw1MC44NDg0NjI4IEwzOC4wMjU5Mjg3LDM5Ljc2ODI0MDcgQzQwLjIwMjQ0NjcsMzcuNzI5OTE4MyA0MC4yMDEyOTg4LDM0LjQxNDAxNzggMzguMDIzNjMyOCwzMi4zNzU2OTU0IEwyNS42ODY1ODY2LDIwLjg5NjgzNDYgWiBNMjEuMzY3OTg5MSwzMy4yNTc4NTgxIEMyMS4xNDE4NDI0LDMzLjUxMzU4ODYgMjAuOTA0MjE2MiwzMy43NjE3OTc2IDIwLjY1Mzk2MjYsMzQuMDAyNDg1MSBMMTkuNzU3NDExNiwzNC44NDA1OTM1IEwxOC4wNTk1ODk4LDMzLjI0Mzg4OTYgQzE2LjA3MzYzMTksMzEuMzQ5NTQ5OSAxNS4xMjU0MjMsMjguNzcwNzU1IDE1LjM4NjAwODMsMjUuOTg2NzMxIEMxNS40NDkxNDU3LDI1LjMxOTQ2NzggMTUuNTc3NzE2NCwyNC42NTg2NTE3IDE1Ljc2NzEyODUsMjQuMDEwNzI5NCBDMTUuOTMyNDMzNywyMy40NTA5MTYgMTYuMTUxNjkyNiwyMi45MDM5OTY2IDE2LjQwNTM5MDIsMjIuMzY4ODk2NyBDMTYuNDQ1NTY4NSwyMi4yODQwMTE0IDE2LjQ3NzcxMTIsMjIuMTk4MDUxNSAxNi41MjAxODU0LDIyLjExNDI0MDcgQzE3LjE0MDA3OTgsMjAuODg3MTY0MSAxNy45OTE4NjA2LDE5Ljc0MjgyMzkgMTkuMDQ0NTMzMSwxOC43NDEzOTE5IEwxOS44OTc0NjE4LDE3Ljk0NjI2MzQgTDIxLjU2NTQzNjksMTkuNTA3NTA4OSBDMjMuNTc0MzUzOSwyMS40MDYxNDY2IDI0LjUzNTE5MDIsMjMuOTk1Njg2NSAyNC4yNzAwMTMxLDI2LjgwMDEyNTkgQzI0LjA1MzA1MDEsMjkuMTE1NjY4OCAyMy4wNDA1NTYsMzEuMzY1NjY3NCAyMS4zNjc5ODkxLDMzLjI1Nzg1ODEgTDIxLjM2Nzk4OTEsMzMuMjU3ODU4MSBaIE0xOC40NjcxMTMsMS43NDA2ODY1NSBMMzIuODYyNDM4MSwxLjc0MDY4NjU1IEMzMy4zMDMyNTE4LDEuNzQwNjg2NTUgMzMuNDc2NTkyNywyLjA1NTUxNDQzIDMzLjUxOTA2NjksMi4xNTIyMTkyNCBDMzMuNTYxNTQxMiwyLjI0Nzg0OTU1IDMzLjY3NjMzNjQsMi41ODUyNDE4OCAzMy4zNjUyNDEzLDIuODc2NDMwOCBMMTkuODk2MzEzOSwxNS40ODM1MTQzIEwxOS4wNjg2NDAxLDE0LjcwODgwMTQgTDE5LjA2NTE5NjIsMTQuNzA1NTc3OSBDMTYuOTkxOTkzOSwxMi43MzYwMjMzIDE1Ljc0NjQ2NTQsMTAuMTkyNjg2OCAxNS41NTU5MDUzLDcuNTQxOTAwNTYgQzE1LjU0NTU3MzcsNy4zOTQ2OTQzNSAxNS41Mzc1MzgsNy4yMzAyOTYxOCAxNS41MzI5NDYyLDcuMDUwODU1MDMgQzE1LjUzMjk0NjIsNy4wMjM5OTI1OSAxNS41MzQwOTQyLDYuOTkwNjgzMTUgMTUuNTMyOTQ2Miw2Ljk2MzgyMDcgQzE1LjUzMDY1MDMsNi44MDU4Njk1MiAxNS41Mjk1MDIzLDYuNjQyNTQ1ODQgMTUuNTM1MjQyMSw2LjQ2NTI1MzY5IEMxNS41MzUyNDIxLDYuNDUwMjEwNzIgMTUuNTM2MzkwMSw2LjQzNDA5MzI1IDE1LjUzNzUzOCw2LjQxOTA1MDI4IEMxNS41NjUwODg5LDUuNTkxNjg2OTIgMTUuNjkyNTExNiw0LjU3MTk4ODQ0IDE2LjA1Mjk2ODcsMy40OTUzNDE1OCBDMTYuMDU0MTE2NywzLjQ4ODg5NDU5IDE2LjA1NzU2MDUsMy40ODI0NDc2IDE2LjA1OTg1NjQsMy40NzYwMDA2MSBDMTYuMTQ0ODA0OSwzLjIyMjQxOTEyIDE2LjI0NDY3NjgsMi45NjY2ODg2MiAxNi4zNTcxNzYxLDIuNzA4ODA5MTMgQzE2LjM5Mjc2MjcsMi42MjgyMjE3OSAxNi40MzYzODQ5LDIuNTQ3NjM0NDUgMTYuNDc0MjY3MywyLjQ2NTk3MjYxIEMxNi41NDE5OTY1LDIuMzIzMDY0NCAxNi42MTU0NjU1LDIuMTgwMTU2MTggMTYuNjkyMzc4MywyLjAzNjE3MzQ3IEMxNy4yNjI5MTA3LDEuODQxNjg5MzUgMTcuODU4Njk4MSwxLjc0MTc2MTA1IDE4LjQ2NzExMywxLjc0MDY4NjU1IEwxOC40NjcxMTMsMS43NDA2ODY1NSBaIE0yLjk0Nzk0MjI5LDE5LjE3OTc4NyBDMS40OTU3ODIzLDE3LjgyMDU0NzIgMS40OTU3ODIzLDE1LjYwOTIzMDYgMi45NDY3OTQzNCwxNC4yNDg5MTYzIEwxNC4wMDg0NjUyLDMuODk2MTI5MjggQzEzLjk5MjM5MzksMy45NjI3NDgxNSAxMy45ODY2NTQxLDQuMDIzOTk0NTMgMTMuOTcxNzMwNyw0LjA5MDYxMzQgQzEzLjkwOTc0MTMsNC4zNjU2ODQ4NSAxMy44NTY5MzU1LDQuNjM1MzgzODIgMTMuODE2NzU3MSw0Ljg5NzU2MTMgQzEzLjc5OTUzNzgsNS4wMTU3NTYwNiAxMy43ODY5MTA0LDUuMTI3NTAzODQgMTMuNzcxOTg3LDUuMjQzNTQ5NjEgQzEzLjc0NTU4NDEsNS40NTczNzQ2OSAxMy43MjM3NzMsNS42NjM2NzgyOCAxMy43MDk5OTc1LDUuODYzNTM0ODggQzEzLjcwMTk2MTksNS45NzQyMDgxNyAxMy42OTM5MjYyLDYuMDgwNTgzNDUgMTMuNjg5MzM0NCw2LjE4Njk1ODc0IEMxMy42ODAxNTA4LDYuMzg2ODE1MzUgMTMuNjc1NTU5LDYuNTczNzc3OTggMTMuNjc1NTU5LDYuNzU1MzY4MTIgQzEzLjY3NTU1OSw2LjgzNTk1NTQ2IDEzLjY3MzI2MzEsNi45MTc2MTczIDEzLjY3NDQxMSw2Ljk5MjgzMjE1IEMxMy42Nzc4NTQ5LDcuMjM2NzQzMTYgMTMuNjg3MDM4NSw3LjQ2MjM4NzcyIDEzLjcwMDgxMzksNy42NTc5NDYzMyBDMTMuOTE3Nzc3LDEwLjY5NDQ3NzMgMTUuMzI3NDYyNywxMy42MDQyMTc2IDE3LjcwOTQ2NDMsMTUuODk2MTI5MyBDMTcuNzI0Mzg3NiwxNS45MTExNjQ1IDE3LjczODE2MzEsMTUuOTI2MjA3NSAxNy43NTMwODY1LDE1LjkzOTEwMTQgTDE4LjU4MTkwODIsMTYuNzE1OTYzNCBMMTcuNzI1NTM1NiwxNy41MTUzODk4IEMxNS4zMTEzOTE0LDE5LjgwOTQ0MjggMTMuODIyNDk2OSwyMi43NjQzMTE5IDEzLjUzNDM2MDgsMjUuODM0MTUyMyBDMTMuNDk5OTIyMiwyNi4yMDI3MDUxIDEzLjQ4OTU5MDYsMjYuNTY1ODg1NCAxMy40OTA3Mzg2LDI2LjkyNzk5MTIgQzEzLjQ5MDczODYsMjcuMDI3OTE5NSAxMy40OTQxODI1LDI3LjEyNjc3MzMgMTMuNDk2NDc4NCwyNy4yMjY3MDE2IEMxMy41MDU2NjIsMjcuNTE4OTY1IDEzLjUyNjMyNTEsMjcuODA5MDc5NCAxMy41NTg0Njc4LDI4LjA5NTk3MDMgQzEzLjU2NjUwMzUsMjguMTY3OTYxNyAxMy41NzEwOTUzLDI4LjI0MjEwMjEgMTMuNTgwMjc4OSwyOC4zMTQwOTM0IEMxMy42MjE2MDUyLDI4LjYyMjQ3NDMgMTMuNjcyMTE1MSwyOC45Mjc2MzE3IDEzLjczOTg0NDMsMjkuMjI4NDkxMSBMMi45NDc5NDIyOSwxOS4xNzk3ODcgWiBNMjEuMTgzMTY4Nyw1MS4wNDcyNDQ5IEw2Ljc4ODk5MTU2LDUxLjA0NzI0NDkgQzYuMzQ4MTc3NzcsNTEuMDQ3MjQ0OSA2LjE3NDgzNjk0LDUwLjczMjQxNyA2LjEzMjM2MjY5LDUwLjYzNjc4NjcgQzYuMDg5ODg4NDUsNTAuNTQwMDgxOSA1Ljk3NTA5MzE5LDUwLjIwMzc2NCA2LjI4NjE4ODMzLDQ5LjkxMTUwMDYgTDE5Ljc1ODU1OTYsMzcuMzAxMTkzNiBMMjAuNTg1MDg1NCwzOC4wNzU5MDY2IEMyMC41OTE5NzMxLDM4LjA4MTI3OTEgMjAuNTk3NzEyOSwzOC4wODU1NzcxIDIwLjYwMzQ1MjcsMzguMDkyMDI0IEMyMi42Njk3NjczLDQwLjA1OTQyOTYgMjMuOTExODUxOSw0Mi41OTk1NDI2IDI0LjEwMTI2NDEsNDUuMjQ0OTU2NCBDMjQuMTExNTk1Nyw0NS4zOTMyMzcxIDI0LjExOTYzMTQsNDUuNTU4NzA5NyAyNC4xMjQyMjMyLDQ1LjczODE1MDkgQzI0LjEyNjUxOTEsNDUuODExMjE2NyAyNC4xMjQyMjMyLDQ1Ljg5NzE3NjYgMjQuMTI0MjIzMiw0NS45NzU2MTQ5IEMyNC4xMjQyMjMyLDQ2LjA4NjI4ODIgMjQuMTI2NTE5MSw0Ni4xOTI2NjM1IDI0LjEyMzA3NTIsNDYuMzExOTMyOCBDMjQuMTE5NjMxNCw0Ni40NTgwNjQ1IDI0LjEwODE1MTgsNDYuNjE2MDE1NyAyNC4wOTc4MjAzLDQ2Ljc3Mzk2NjggQzI0LjA5NDM3NjQsNDYuODMzMDY0MiAyNC4wOTIwODA1LDQ2Ljg4Nzg2MzYgMjQuMDg3NDg4Nyw0Ni45NDkxMSBDMjQuMDY5MTIxNCw0Ny4xNjE4NjA2IDI0LjA0Mzg2NjUsNDcuMzg0MjgxNiAyNC4wMDk0Mjc5LDQ3LjYxMzE0OTcgQzI0LjAwODI4LDQ3LjYyMTc0NTcgMjQuMDA3MTMyLDQ3LjYzMDM0MTYgMjQuMDA1OTg0MSw0Ny42Mzg5Mzc2IEMyMy44OTgwNzY1LDQ4LjM1NDU1MzIgMjMuNzAxNzc2Niw0OS4xMzU3MTMyIDIzLjM3MTE2NjMsNDkuOTI0Mzk0NiBDMjMuMzY3NzIyNCw0OS45MzUxMzk2IDIzLjM2MzEzMDYsNDkuOTQ0ODEwMSAyMy4zNTk2ODY4LDQ5Ljk1NTU1NSBDMjMuMjY4OTk4NSw1MC4xNjgzMDU2IDIzLjE2MjIzODksNTAuMzc5OTgxNyAyMy4wNTIwMzU1LDUwLjU5MTY1NzggQzIzLjAyNDQ4NDYsNTAuNjQ0MzA4MiAyMi45OTkyMjk3LDUwLjY5Njk1ODYgMjIuOTY5MzgyOSw1MC43NDg1MzQ1IEMyMi4zOTY1NTQ2LDUwLjk0NjI0MjEgMjEuNzk3MzIzMyw1MS4wNDcyNDQ5IDIxLjE4MzE2ODcsNTEuMDQ3MjQ0OSBMMjEuMTgzMTY4Nyw1MS4wNDcyNDQ5IFogTTM2LjcxMDM3NSwzOC41Mzc5NDA3IEwyNS42NDg3MDQyLDQ4Ljg5MDcyNzYgQzI1LjY2NDc3NTUsNDguODI0MTA4OCAyNS42NzE2NjMyLDQ4Ljc2MTc4NzkgMjUuNjg2NTg2Niw0OC42OTUxNjkgQzI1Ljc0NzQyODEsNDguNDIwMDk3NiAyNS44MDAyMzM5LDQ4LjE1MTQ3MzEgMjUuODQwNDEyMiw0Ny44OTAzNzAxIEMyNS44NTg3Nzk1LDQ3Ljc3MTEwMDkgMjUuODcxNDA3LDQ3LjY1ODI3ODYgMjUuODg1MTgyNCw0Ny41NDIyMzI4IEMyNS45MTE1ODUzLDQ3LjMyODQwNzcgMjUuOTMzMzk2NCw0Ny4xMjMxNzg3IDI1Ljk0ODMxOTgsNDYuOTIzMzIyIEMyNS45NTUyMDc1LDQ2LjgxMjY0ODggMjUuOTYzMjQzMiw0Ni43MDYyNzM1IDI1Ljk2NzgzNSw0Ni41OTk4OTgyIEMyNS45NzcwMTg2LDQ2LjQwMDA0MTYgMjUuOTgxNjEwNCw0Ni4yMTQxNTM1IDI1Ljk4MTYxMDQsNDYuMDMzNjM3OCBDMjUuOTgyNzU4NCw0NS45NTE5NzYgMjUuOTg1MDU0Myw0NS44NjkyMzk2IDI1Ljk4Mjc1ODQsNDUuNzkyOTUwMyBDMjUuOTc5MzE0NSw0NS41NTAxMTM4IDI1Ljk3MDEzMDksNDUuMzIzMzk0NyAyNS45NTYzNTU1LDQ1LjEyODkxMDYgQzI1LjczOTM5MjQsNDIuMDkyMzc5NiAyNC4zMzA4NTQ2LDM5LjE4MjYzOTQgMjEuOTQ3NzA1MSwzNi44OTA3MzU0IEMyMS45MTc4NTgzLDM2Ljg1OTU3NSAyMS44ODQ1Njc3LDM2LjgyOTQ4OSAyMS44NTAxMjkxLDM2LjgwMTU1MjEgTDIxLjg1MjQyNTEsMzYuNzk5NDAzMSBMMjEuMDc0MTEzMiwzNi4wNzA4OTM1IEwyMS45NzY0MDM5LDM1LjIyNTI2MzcgQzI0LjM2NDE0NTMsMzIuOTM3NjU3OCAyNS44MzY5Njg0LDI5Ljk5ODkwNjEgMjYuMTIyODA4NiwyNi45NTI3MDQ2IEMyNi4xNTgzOTUxLDI2LjU4MjAwMjggMjYuMTY3NTc4NywyNi4yMTU1OTkxIDI2LjE2NjQzMDgsMjUuODUxMzQ0MyBDMjYuMTY2NDMwOCwyNS43NTI0OTA1IDI2LjE2Mjk4NjksMjUuNjU1Nzg1NyAyNi4xNjA2OTEsMjUuNTU4MDA2NCBDMjYuMTUxNTA3NCwyNS4yNTM5MjM1IDI2LjEzMDg0NDIsMjQuOTU0MTM4NiAyNi4wOTY0MDU3LDI0LjY1NjUwMjcgQzI2LjA4OTUxOCwyNC41OTQxODE4IDI2LjA4NjA3NDEsMjQuNTI5NzExOSAyNi4wNzgwMzg0LDI0LjQ2NzM5MSBDMjYuMDM2NzEyMSwyNC4xNjExNTkxIDI1Ljk4NjIwMjIsMjMuODU4MTUwNyAyNS45MTk2MjEsMjMuNTYwNTE0OCBMMzYuNzA5MjI3MSwzMy42MDcwNjk5IEMzOC4xNjEzODcxLDM0Ljk2NjMwOTcgMzguMTYxMzg3MSwzNy4xNzc2MjY0IDM2LjcxMDM3NSwzOC41Mzc5NDA3IEwzNi43MTAzNzUsMzguNTM3OTQwNyBaIiBpZD0iRmlsbC0xIiBmaWxsPSIjRkZGRkZGIj48L3BhdGg+CiAgICAgICAgICAgIDxwYXRoIHN0cm9rZT0iIzAwN0RGQSIgZD0iTTI1LjI1MDY2MDIsNDQuMTc0MjE5MiBDMjUuMDQwNzA4Miw0MS4yMzAxOTIzIDIzLjM1NzkyNDQsMzkuMjUzODk1MiAyMS4wNzQxMTMyLDM3LjA2OTc5NDYgTDE5LjExMjc2MzYsMzUuMzcwMTUzNyBMNC45NzE3ODI2NSw0OC42ODEyMDA2IEMzLjU5Mjc5OTYzLDQ5Ljk3OTk0OTUgMy45MTUwMjQyNSw1Mi43ODc5MzE0IDYuNzg4OTkxNTYsNTIuNzg3OTMxNCBMMjEuMjE0MjQ1Miw1Mi43ODc5MzE0IEMyMi42MDU3ODcsNTIuNzg3OTMxNCAyMy41NzYxMTk4LDUyLjUwNTYxMyAyNC4xMjUyNDM2LDUxLjk0MDk3NjIgQzI1LjQyMTExNCw0OS43MzgxNzk4IDI1LjQ2MDYxMjIsNDcuMTE4MjQ2MiAyNS4yNTA2NjAyLDQ0LjE3NDIxOTIgWiIgaWQ9IkZpbGwtMjIiPjwvcGF0aD4KICAgICAgICAgICAgPHBhdGggc3Ryb2tlPSIjMDA3REZBIiBkPSJNMTkuMTEyNzYzNiwzNS4zNzAxNTM3IEwyMS4wNzQxMTMyLDM3LjA2OTc5NDYgQzIxLjA3NTI3OTYsMzcuMDcxOTk0MSAyNC45NzM3OTA0LDQwLjE2NjcwNTMgMjUuMzQ2MzUyMiw0NC43NDQzODEyIEMyNS40OTEzNzk3LDQ2LjUyNjMzNzMgMjUuMTU5NTY3Myw0OS45NzMyNzI2IDIzLjg1MDg2NjUsNTIuMTgzNzY3MiBDMjQuODc2MzA4LDUxLjY5NDc4ODYgMjUuNjk5MDM5Myw1MS4xODgzMDUyIDI2LjMxOTA2MDMsNTAuNjY0MzE2OSBMMzguNDE5MDY1OSwzOS4zNzYzNjA5IEM0MC4yNzM2NDE5LDM3LjYyNjY2MDkgMzkuNjkwMjU5MiwzMy45MjYxNDM3IDM3LjgzNDUxNjgsMzIuMTc3NTQzNSBMMzEuOTc5MTg4OCwyNi42NTU3MDU5IEwyMS4yMTA3MTk2LDE2LjcxNDg4ODkgQzIzLjUwNjE5NDgsMTguODYzNzk3NiAyNC42MTE4NTYxLDIyLjU2MTQ0MSAyNC4zMTMyNTc3LDI1Ljc1NTExMDkgQzI0LjAzNjgyMDksMjguNzEyMzM0OCAyMy40MzAzNjU5LDMwLjkzNTAzMzEgMjEuMjEwNzE5NiwzMy40MjA2NTEzIEwxOS4xMTI3NjM2LDM1LjM3MDE1MzcgWiIgaWQ9IkZpbGwtMTAiPjwvcGF0aD4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==")'
            };
            options = { ...skipcash.sdk.defaults, ...options, ...constants };
            options.btnStyle = { ...defaultBtnStyle, ...options.btnStyle };
            options.btnHoverStyle = { ...defaultBtnHoverStyle, ...options.btnHoverStyle };
            options.logoImgStyle = { ...defaultImgStyle, ...options.logoImgStyle };
            options.logoImgHoverStyle = { ...defaultImgHoverStyle, ...options.logoImgHoverStyle };

            var getStyleString = function (obj) {
                var style = '';
                var styleKeys = Object.keys(obj);
                for (var i = 0; i < styleKeys.length; i++) {
                    style += styleKeys[i] + ': ' + obj[styleKeys[i]] + '; ';
                }
                return style;
            }

            if (options.container == null) {
                if (options.onError != null) options.onError('Container is a required parameter');
                return;
            }
            if (options.clientId == null) {
                if (options.onError != null) options.onError('clientId is a required parameter');
                return;
            }
            if (options.onCreatePayment == null) {
                if (options.onError != null) options.onError('onCreatePayment is a required parameter');
                return;
            }
            if (options.onSuccess == null) {
                if (options.onError != null) options.onError('onSuccess is a required parameter');
                return;
            }
            if (options.environment == 'sandbox') { options.baseUrl = options.sandBoxUrl; }
            else if (options.environment == 'production') { options.baseUrl = options.productionUrl; }
            else {
                if (options.onError != null) options.onError('Invalid environment value');
                return;
            }

            var container = document.getElementById(options.container);
            if (container != null) {
                container.innerHTML = '';
                var randID = new Date().getTime();
                var btnClass = 'skipcash-btn-' + randID;
                var logoClass = 'skipcash-logo-' + randID;
                var btn = document.createElement('a');
                btn.href = 'javascript:void(0)';
                btn.className = btnClass;
                btn.innerHTML = '<span>' + options.btnInnerHtml + '</span>';
                var logo = document.createElement('img');
                logo.src = options.logoImgSrc;
                logo.className = logoClass;
                btn.append(logo);
                var afterLogo = document.createElement('strong');
                afterLogo.innerHTML = options.btnHmlAfterLogo;
                btn.append(afterLogo);
                container.appendChild(btn);
                var styles = document.createElement('style');
                styles.type = 'text/css';
                styles.innerHTML = '.' + btnClass + ' { ' + getStyleString(options.btnStyle) + ' } ';
                styles.innerHTML += '.' + btnClass + ':hover { ' + getStyleString(options.btnHoverStyle) + ' } ';
                styles.innerHTML += '.' + logoClass + ' { ' + getStyleString(options.logoImgStyle) + ' } ';
                styles.innerHTML += '.' + btnClass + ':hover .' + logoClass + ' { ' + getStyleString(options.logoImgHoverStyle) + ' } ';
                container.appendChild(styles);

                btn.addEventListener('click', function (e) {
                    var newWindow = options.openPopup('about:blank');
                    if (!newWindow) {
                        alert("Failed to open a popup window for SkipCash payment! Please check your browser settings to allow popups.");
                        return;
                    }
                    options.beforeCreatePayment()
                        .then((data) => {
                            var proceed = data[0];
                            data = data[1];
                            if (!proceed) {
                              newWindow.close();
                              return false;
                            }

                            options.onCreatePayment(data)
                                .then(value => {
                                    options.transactionId = value;
                                    newWindow.location.href = options.baseUrl + options.payUrl + value;
                                    options.onWindowClose(newWindow);
                                })
                                .catch(err => {
                                    newWindow.close();
                                    if (options.onError != null) options.onError('Error when creating payment: ' + err);
                                })
                    })
                });

                options.openPopup = function (url) {
                    var width = 1200;
                    var height = 750;
                    var windowWidth = window.innerWidth;
                    var windowHeight = window.innerHeight;
                    if (windowWidth > 1200) { }
                    else if (windowWidth > 1100) { width = 1050; height = 700; }
                    else if (windowWidth > 1000) { width = 900; height = 700; }
                    else { width = windowWidth - 10; height = windowHeight - 10; }
                    var left = parseInt((windowWidth - width) / 2);
                    var top = parseInt((windowHeight - height) / 2);
                    var isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) || /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.platform) || window.matchMedia("only screen and (max-width: 768px)").matches;
                    if (isMobile) {
                        return window.open(url, "_skipcash");
                    } else {
                        return window.open(url, '_skipcash', 'toolbar=0,location=0,menubar=0,left=' + left + ',top=' + top + ',width=' + width + ',height=' + height);
                    }
                }

                options.onWindowClose = function (newWindow) {
                    if (newWindow.closed) {
                        fetch(options.checkUrl.replace('ORDER_ID', window["skipcash"].sdk.order_id) + '&transaction_id=' + options.transactionId + '&client_id=' + options.clientId, {
                            method: "GET",
                        }).then(result => result.json())
                            .then(result => {
                                if (result.returnCode == 200 && result.resultObj != null) {
                                    if (result.resultObj.statusId == 2) {
                                        if (options.onSuccess != null) options.onSuccess();
                                    } else if (result.resultObj.statusId == 4 && options.onFailure != null) {
                                        options.onFailure();
                                    } else {
                                        if (options.onCancel != null) options.onCancel();
                                    }
                                } else {
                                    if (options.onCancel != null) options.onCancel();

                                    if (options.onError != null) {
                                        if (result.errorMessage)
                                            options.onError('Failed to retrieve information about the payment: ' + result.errorMessage);
                                        else
                                            options.onError('Failed to retrieve information about the payment');
                                    }

                                }
                            }).catch(err => {
                                if (options.onError != null) options.onError('Failed to retrieve information about the payment');
                            });
                    } else {
                        setTimeout(function () { options.onWindowClose(newWindow); }, 100);
                    }
                }
            } else {
                if (options.onError != null) options.onError('Container was not found');
            }
        }
    }
}
