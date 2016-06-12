# Photo editing on Chrome OS

this was originally posted as a photo editing software as the final project of CS242.

Currently it has the functionality of adjust the contrast brightness attributes of the photo based on
[histogram equlization](https://en.wikipedia.org/wiki/Histogram_equalization), but more specifically we
follow the varient implementation of a [local histogram equlisation](https://www.eecis.udel.edu/~barner/courses/eleg675/papers/Enhancement%20in%20the%20Spatial%20Domain/Adaptive%20Image%20Contrast%20Enhancement.pdf)

Currently there are some dummy frontend that has not been finished yet. To test with the code
do
1. `bower install`
2. compile with nacl with the support of opencv
3. `python3 -m http.server` or `python2 -m SimpleHTTPServer`