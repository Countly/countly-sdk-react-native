/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */
import React, {
  Component
} from 'react';
import PropTypes from 'prop-types';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Alert,
  Button,
  TextInput,
  TouchableOpacity,
  TouchableHighlight
} from 'react-native';

import Modal from 'react-native-modal'
export default class StarRating extends Component {
  
  static propTypes = {
    maxStars: PropTypes.number,
    rating: PropTypes.number,
    onStarChange: PropTypes.func,
    style: View.propTypes.style,
    starSize: PropTypes.number,
    text: PropTypes.string,
    onSubmitModal: PropTypes.func,
  };
  
  static defaultProps = {
    // disabled: false,
    // maxStars: 5,
    // rating: 0,
    // starSize: 30
  };
  state = {
    isModalVisible: false
  }
  constructor(props) {
    super(props);
    const roundedRating = (Math.round(this.props.rating * 2) / 2);
    this.state = {
      maxStars: this.props.maxStars,
      rating: roundedRating,
      modalVisible: false,
      text: this.props.text,
    }
  }

  pressStarButton (rating) {
    if (!this.props.disabled) {
      if (rating != this.state.rating) {
        if (this.props.onStarChange) {
          this.props.onStarChange(rating);
        }
        this.setState({
          rating: rating,
        });
      }
    }
  }
  
  // setModalVisible(visible) {
  //   this.setState({modalVisible: visible});
  // }

  _showModal = () => this.setState({ isModalVisible: true })
 
  _hideModal = () => this.setState({ isModalVisible: false })
 
  
  render() {
    const starsLeft = this.state.rating;
    const starButtons = [];
    for (let i = 0; i < this.state.maxStars; i++) {
      const starColor = (i + 1) <= starsLeft ? styles.selectedColor : styles.unSelectedColor;
      const starStr = '\u2605'
      starButtons.push(
        <TouchableOpacity
          activeOpacity={0.20}
          key={i + 1}
          onPress={this.pressStarButton.bind(this, (i + 1))}
        >
          <Text style={[starColor,{fontSize:this.props.starSize}]}>{starStr}</Text>

        </TouchableOpacity>
      );
    }
    return (
      <ScrollView style={{marginTop: 22, flex: 1}}>
        <TouchableOpacity onPress={this._showModal}>
          <View style={styles.button}>
            <Text>Show Modal</Text>
          </View>
        </TouchableOpacity>
        <Modal isVisible={this.state.isModalVisible}
          >
         <View style={[styles.starRatingModal]}>
          <View>
            <View style={[styles.starRatingContainer]}>
              {starButtons}
            </View>
            <TextInput
              style={{height: 40, borderColor: 'gray', marginTop: 22}}
              onChangeText={(text) => this.setState({text})}
              value={this.state.text}
            />
            <View style={{flexDirection: "row"}}>
            <TouchableHighlight style={styles.wrapper}
          onPress={() => Alert.alert(
            'You are  Rated '+this.state.rating+ ' Star!',
            this.state.text,
            [
              {text: 'Cancel', onPress: () => this.setState({isModalVisible: false})},
              {text: 'OK', onPress: () => this.props.onSubmitModal(this.state.text)},
            ]
          )}>
          <View style={styles.buttonSubmit}>
            <Text>Submit</Text>
          </View>
        </TouchableHighlight>
            <TouchableHighlight onPress={() => {
              this.setState({isModalVisible: false})
            }}>
          <View style={styles.buttonClose}>
            <Text>close</Text>
          </View>
            </TouchableHighlight>
          </View>
          </View>
         </View>
        </Modal>
      </ScrollView>
    );
  }
}

const styles = StyleSheet.create({
  starRatingModal: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  starRatingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  selectedColor: {
    color:'#FF4946'
  },
  unSelectedColor:{
    color:'#999999'
  },
  button: {
    backgroundColor: '#5bbd72',
    padding: 10,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonSubmit: {
    backgroundColor: '#5bbd72',
    padding: 10,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  },
  buttonClose: {
    backgroundColor: 'red',
    padding: 10,
    margin: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
  }
});

