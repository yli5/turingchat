#! /usr/bin/env python
# This script aims to learn turing bot using logistic regression

import numpy as np
import csv
from sklearn.linear_model import LogisticRegressionCV
import matplotlib.pyplot as plt

import gensim
# import pretrained model
print 'import pretrained model, this may takes few minutes ...'
model = gensim.models.Word2Vec.load_word2vec_format('GoogleNews-vectors-negative300.bin', binary=True)  


# load data
question_answer_list = []
with open('answered_Batch_2610757_batch_results.csv','r') as f1:
    question_answer_list.append(f1.readlines())
with open('answered_Batch_2616987_batch_results.csv','r') as f1:
    question_answer_list.append(f1.readlines())
with open('answered_Batch_2619701_batch_results.csv','r') as f1:
    question_answer_list.append(f1.readlines())
question_answer_list = sum(question_answer_list, [])

chars_to_remove = ['?']
question_list = []
answer_list = []

for pair in question_answer_list:
    pair = pair.translate(None, ''.join(chars_to_remove))
    question, answer = pair.split(':')
    question_list.append(question.split())
    answer_list.append(answer)


# preprocessing 
X = []
for question in question_list:
    x = np.zeros(300)
    for word in question:
        try:
            x = x + model[word]
        except:
            pass
    X.append(x)
X = np.array(X)

Y = []
for answer in answer_list:
    if 'Y' in answer:
        Y.append(1)
    else:
        Y.append(0)
Y = np.array(Y)





# model 1: logistic regression with sum over word vectors

# training:
clf = LogisticRegressionCV()
clf.fit(X, Y)


# testing:
ask = 'Does the rain make you happy'
print('question:', ask)
ask = ask.split()
x = np.zeros(300)
for word in ask:
        try:
            x = x + model[word]
        except:
            pass
x = x.reshape(1,-1)
print('answer:',clf.predict(x))
