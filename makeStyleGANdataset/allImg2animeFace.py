import cv2
import sys
import os

def main(dirPath, cascade_file = "../lbpcascade_animeface.xml"):
    if not os.path.isfile(cascade_file):
        raise RuntimeError("%s: not found" % cascade_file)

    # create directory if dose not exist
    output_dir = 'faces'
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
    output_dir2 = 'detect'
    if not os.path.exists(output_dir2):
        os.makedirs(output_dir2)

    # load lbpcascade.xml
    cascade = cv2.CascadeClassifier(cascade_file)

    # get filename list from input dir
    files = os.listdir(dirPath)
    filesList = [f for f in files if os.path.isfile(os.path.join(dirPath, f))]

    for i, filename in enumerate(filesList):
        image = cv2.imread(dirPath + "/" + filename, cv2.IMREAD_COLOR)
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        gray = cv2.equalizeHist(gray)
        
        faces = cascade.detectMultiScale(gray,
                                         # detector options
                                         scaleFactor = 1.1,
                                         minNeighbors = 5,
                                         minSize = (24, 24))

        # extract anime faces
        for j, (x, y, w, h) in enumerate(faces):
            face_image = image[y:y+h, x:x+w]
            output_path = os.path.join(output_dir, '{0}-{1}.jpg'.format(i, j))
            cv2.imwrite(output_path, face_image)
            # set detect on img
            cv2.rectangle(image, (x,y), (x+w,y+h), color=(0,0,255), thickness=3)

        # # check detect per img
        # cv2.imshow("AnimeFaceDetect", image)
        # cv2.waitKey(0)

        # output img with detect
        output_path2 = os.path.join(output_dir2, '{0}.jpg'.format(i))
        cv2.imwrite(output_path2, image)


# hundle error
if len(sys.argv) != 2:
    sys.stderr.write("usage: allImg2animeFace.py <dirPath>\n")
    sys.exit(-1)
    
main(sys.argv[1])
