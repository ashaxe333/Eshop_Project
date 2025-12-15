const express = require('express');
const app = express();
app.use(express.json());

const crypto = require('crypto');


async function fetchComponents(component){
    /*const payload = {
      component: component,
      callbackUrl: 'http://localhost:8080/update',
      event_id: event_counter
    };

    const body = JSON.stringify(payload);
    const sig = crypto.createHmac('sha256', SHARED_SECRET).update(body, 'utf8').digest('hex');
    */

    const components = await fetch(`http://10.2.7.162:8080/parts/${component}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', /*'X-signature':sig*/},
    });


    return components;
}

app.post('api/loadcomp',async (req,res) =>{
    const components = await fetchComponents(req.body.component);
    res.json({
        components: components
    });
});

app.listen(8080, () => {
console.log('Server runs on http://localhost:8080');
});
