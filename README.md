# DoubleBlind
For assisting with performing double blind social experiments.

## Introduction
This application is intended to be used to facilitate a type of social experiment I like to host occasionally. I use it to gather opinions on a set of something (usually a beverage, like beer or wine). These experiments are double blind, by which I mean that neither the host nor the participants know the identity of the subject they are giving an opinion on. 

## What it does
- Helps the host to alias each subject (once for a single blind study and twice for a double blind study).
- Allow the host to specify what is asked of the participant.
- Prevents participants from reviewing subjects multiple times (if desired).
- Makes it easier for participants to privately review subjects.
- Exports the data in an easy to analyze format.

## How it works
1. The host uses the management software to create the study, specify the subjects and the questions, and set options.
2. The subjects are aliased zero, one, or two times. Assuming the subjects are in indistinguishable vessels, one person gives each subject an alias and records it in the software. This happens out of view of anyone else. Then a different person scrambles or re-alias the subjects and records this (also out of view of anyone). Now there is nobody who knows the true identity of any of the subjects.
3. Begin the trial. Participants may use their phone to privately submit reviews.
4. Conclude the trial. The results may be exported in '.csv' format.
