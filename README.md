#Kendo Mobile Simulator wrapper

Link to the demo: http://demos.kendoui.com/mobile/simulator/

The <b>Kendo Mobile Simulator</b> is a simple wrapper useful to show off application functionality on different mobile platforms in the convenience of a desktop browser. Just drop your application in the <b>/content</b> folder and fire it up.

Project directory structure:
<ul>
<li>
/content - drop your application here - index.html or whichever default file is supported by your server should be there.
</li>
<li>
/devices - contains device specific images and CSS.
</li>
<li>
/images - contains images, including small device images.
</li>
<li>
/js - contains javascript files.
</li>
<li>
/styles - contains CSS and Firefox icon masks.
</li>
<li>
/index.html - start here.
</li>
</ul>

This is the "PayPal Enhanced Checkin" version of the simulator. It simulates the main components
of the PayPal consumer app hosting a post-checkin URL. You should be able to deploy it
on your own app server just by copying the files and going to index.html?url=[yoururl]

Because of cross site scripting, you shouldn't host this service for apps on other domains
(and it wouldn't work out of the box anyawys).