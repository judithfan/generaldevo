#!/usr/bin/env python
from __future__ import division
import numpy as np
import matplotlib
from matplotlib import pylab,mlab,pyplot
plt = pyplot
#from matplotlib.pyplot import imshow
from PIL import Image
from skimage.transform import PiecewiseAffineTransform, warp
import urllib, cStringIO
from time import gmtime, strftime

# define image filenames
cars = ['limoToSUV','limoToSedan','limoToSmart','smartToSedan','suvToSedan','suvToSmart'] 
furniture = ['bedChair', 'bedTable', 'benchBed', 'chairBench','chairTable', 'tableBench']

# specify car inds
car_inds = map(str,np.arange(0,100))
car_inds = [i.zfill(2) for i in car_inds]
inds = map(np.int,np.linspace(0,99,5)) ## subset car inds so as to not make overwhelmingly many of them
car_inds = [car_inds[i] for i in inds]

# specify furniture inds
furniture_inds = map(str,np.arange(1,101))
inds = map(np.int,np.linspace(0,99,5)) ## subset inds so as to not make overwhelmingly many of them
furniture_inds = [furniture_inds[i] for i in inds]

#viewpoints = map(str,np.arange(0,40))
# specify subset of all viewpoints so it doesn't take forever to do this thing
viewpoints = map(str,map(int,np.linspace(0,39,10)))

# construct list of car names
car_names = []
for c in cars:
    for i in car_inds:
        for v in viewpoints:
            car_names.append(c+'_'+i+'_'+v+'.png.png')            

# construct list of furniture names
furniture_names = []
for f in furniture:
    for i in furniture_inds:
        for v in viewpoints:        
            furniture_names.append(f+'_'+i+'_'+v+'.png.png')

# put name list together
all_names = car_names + furniture_names

for fn in all_names:

	# load in image
	URL = 'https://s3.amazonaws.com/morphrecog-images-1/' + fn
	file = cStringIO.StringIO(urllib.urlopen(URL).read())
	im = Image.open(file)

	# give user feedback about progress
	print 'loading ', fn, ' at ', strftime("%Y-%m-%d %H:%M:%S")

	# im = Image.open("original/car.png")
	# convert to array
	image = np.asarray(im)

	rows, cols = image.shape[0], image.shape[1]
	src_cols = np.linspace(0, cols, 20)
	src_rows = np.linspace(0, rows, 20)
	src_rows, src_cols = np.meshgrid(src_rows, src_cols)
	src = np.dstack([src_cols.flat, src_rows.flat])[0]

	# add cos oscillation to row and column coordinates
	dst_rows = src[:, 1] - np.random.randint(40,60,len(src[:, 1])) * \
	           np.cos(np.linspace(0, 3 * np.pi, src.shape[0]) + np.random.randint(1,10,len(src[:, 1])))
	# dst_cols = src[:, 0] 
	dst_cols = src[:, 0] - np.random.randint(40,60,len(src[:, 1])) * \
	           np.cos(np.linspace(0, 3 * np.pi, src.shape[0]) + np.random.randint(1,10,len(src[:, 1])))
	dst_rows *= 1.5
	dst_rows -= 1.5 * 50

	dst_cols *= 1.5
	dst_cols -= 1.5 * 50

	dst = np.vstack([dst_cols, dst_rows]).T

	# derive transformation matrix
	tform = PiecewiseAffineTransform()
	tform.estimate(src, dst)

	out_rows = image.shape[0] - 1.5 * 50
	out_cols = cols
	out = warp(image, tform, output_shape=(out_rows, out_cols))

	# turn black pixels gray
	out[(out==0)] = 0.5

	# save out diffeo scrambled image
	result = Image.fromarray((out * 255).astype(np.uint8))
	result.save('diffeo/'+fn.split('.')[0]+'.png')