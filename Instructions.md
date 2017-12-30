# Problem Statement:
Design an API service to manage Machine Learning experiments

# Description:
In order to build machine learning model for any given problem, you need to run multiple experiments on training data in order to find optimal parameters for the model. These parameters could be learning rate(i), Number of layers in model (j), Number of steps (k) etc. You can then compare those experiments and choose the parameters from one which offers best accuracy. The accuracy will be printed by the script.

You need to design an API service which user can use to upload training data (image files) and manage these experiments. You will need to run multiple experiments iterating on:
1. i - Learning rate [0.001,0.01,0.1]
2. j - Number of layers in model [1,2,4]
3. k - Number of steps [1000,2000,4000].

i, j, k will be passed to the script

After running the experiment store the result (accuracy) for each experiment. Store the parameters (i,j,k) for the experiment with the highest accuracy (as printed by the train.py script).

When we uplaod a new image to test the model, use the experiment parameters that gave the highest accuracy and pass them to the test.py script.

### Make any assumptions needed to complete the assignment on time

# API Endpoints should support following functions:
1. Create a new model
2. Upload images for training the model
3. Generate experiments with different parameters for model
4. Run the train.py script with multiple parameters (3x3x3) 27 experiments
5. Get the best result from each of the experiments
6. Store the results from each of the experiments and select the best experiment (highest accuracy) along with the parameters used for the experiment and the accuracy for each experiment
7. BONUS: Upload an Image to Test the API and use the model with the best accuracy to return the result (test.py)

You can choose any language/framework to design the API. You are free to choose the database/Queue best for the data model for this problem.


# Deliverables:
## Host the API service on aws micro instance and send simple instructions to use api endpoints

1) API endpoint posted on AWS micro instance that has train, upload, (optional test) endpoints
2) Script to test the API (python script, bash script, golang program or Postman collection. No other language/framerwork will do. Please clearly state, all additional libraries that would be needed to run the code)
3) All Source code used hosted on github

# Things we will judge you on (in order of importance):
1) Finishing the assignment (50%)
2) Make sure whatever you have built works, even if all the features are not implemented. Suggestion: Don't try the bonus part till everything else has been completed (30%)
3) Ease of use (10%)
4) Architecture choices (to complete the assignment on time, not for scaling to multiple users) (5%)
5) Code quality (5%)




# To train:

python train.py --i 0.001 --j 2 --k 2000 --images /home/ubuntu/TrainingImages/

--i: Learning Rate

--j: Number of Layers

--k: Number of Steps

--images: Path to directory of training images

# To test (predict):

python test.py --i 0.001 --j 2 --k 2000 --image /home/ubuntu/TestImages/1.jpg

--i: Learning Rate

--j: Number of Layers

--k: Number of Steps

--image: Path to image to be used for prediction
