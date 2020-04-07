import React, { Component } from 'react'
import { Text, View, FlatList, SafeAreaView,StyleSheet, TouchableOpacity, TextInput,Button, TouchableWithoutFeedback} from 'react-native';
import moment from 'moment';
import Modal from 'react-native-modal';

export default class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
       data: [],
       modalVisible: false,
       rawData :[],
       name: '',
       page: 0,
    }
  }

  componentDidMount() {
    this.getData();
    this.timer = setInterval(() => {
      this.getData();
    }, 10000);
  }

  componentWillUnmount =()=>{
    clearInterval(this.timer)
  }

  getData=()=>{4
    const {page}=this.state;
    fetch(`https://hn.algolia.com/api/v1/search_by_date?tags=story&page=${page}`)
    .then(response=>response.json())
    .then(responseJson=> this.setState( prevState => {
        return {
          data: [...prevState.data, ...responseJson.hits],
          page: page + 1,
        }
      })
    )
    .catch(error=> console.log(error));
  }

  displayModal=(item)=> {
    this.setState({
      modalVisible: true,
      rawData: [item.item]
    })
  }

  filteredTitleArray=()=>{
    const {data}= this.state;
    const newData = data.sort((a,b)=> {
      if(a.title.toLowerCase() < b.title.toLowerCase()) return -1;
      if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
      return 0;
    });
    this.setState({
      data: newData
    })
  }

  filteredCreatedArray = () => {
    const { data } = this.state;
    const newData = data.sort((a, b) => {
      if (a.created_at.toLowerCase() < b.created_at.toLowerCase()) return -1;
      if (a.created_at.toLowerCase() > b.created_at.toLowerCase()) return 1;
      return 0;
    });
    this.setState({
      data: newData
    })
  }



  //Display the title, URL, created_at, and author of each post in a table.
  renderItem = item =>
    <TouchableOpacity style={styles.list} onPress={() => this.displayModal(item)}>
        <Text style={[styles.title,styles.bold]}>{item.item.title}</Text>
        <Text style={styles.url}>{item.item.url}</Text>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <Text style={styles.normalText}>{item.item.author}</Text>
          <Text style={styles.normalText}>{moment(item.item.created_at).format('DD MMM, YYYY, LT')}</Text>
        </View>
    </TouchableOpacity>

  render() {
    const {data, modalVisible,rawData,name,page}= this.state;

    const len = data.length;

    const searchArray = data.filter(item=>  {
      if(name === '') return item;
      if (item.title.toLowerCase().includes(name.toLowerCase()) || item.author.toLowerCase().includes(name.toLowerCase()) || item.url && item.url.toLowerCase().includes(name.toLowerCase()) ) return item;
    })

    return (
     <SafeAreaView style={styles.container}>
        <TextInput value={name} onChangeText={text=> this.setState({name: text })} style={styles.input}
        placeholderTextColor="blue"
        placeholder="Search by Title/Author/URL  here..." />
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', padding: 10,}}>
          <Text style={[styles.bold,{textAlign: 'center'}]}>Page Refresh  : {page} times</Text>
          <Text style={[styles.bold, { textAlign: 'center' }]}>Total Posts  : {len} posts</Text>
        </View>
         <View style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => this.filteredTitleArray()} style={styles.btn}>
            <Text style={styles.bold}>Filter by title</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => this.filteredCreatedArray()} style={styles.btn}>
            <Text style={styles.bold}>Filter by Created At</Text>
          </TouchableOpacity>
          </View>
        <FlatList
          data={searchArray}
          renderItem={item =>this.renderItem(item)} keyExtractor={(item,index)=> index.toString()}
        />
        <Modal isVisible={modalVisible} customBackdrop={
          <TouchableWithoutFeedback onPress={()=> this.setState({
            modalVisible: !modalVisible
          })}>
            <View style={{ flex: 1 }} />
          </TouchableWithoutFeedback>
        }>
          <View style={styles.centeredView}>
            {rawData !== undefined ?
              rawData.map(item =>
                <Text key={item.created_at} style={styles.modalText}>{JSON.stringify(item)}</Text>)
              : null}
              <TouchableOpacity style={styles.btn} onPress={() => {
              this.setState({
                modalVisible: !modalVisible
              })
            }}><Text style={styles.bold}>Close Modal</Text></TouchableOpacity>
          </View>
        </Modal>
      </SafeAreaView>
    )
  }
}

const styles=StyleSheet.create({
  container:{
    flex: 1,
    padding: 10,
  },
  title:{
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0c9'
  },
  normalText:{
    fontSize: 14,
    paddingVertical: 4,
  },
  url:{
    fontSize: 14,
    paddingVertical: 4,
    color: 'blue',
  },
  list:{
    margin: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#e3e3e3',
    padding: 10,
  },
  bold: {
    fontWeight: 'bold',
  },
  centeredView:{
    justifyContent: 'center',
    alignItems: 'center',
    width: '95%',
    alignSelf: 'center',
    backgroundColor: '#F9F9ED',
    padding: 20,
    paddingVertical: 40,
    marginTop: '20%',
  },
  btn:{
    padding: 10,
    paddingHorizontal: 20,
    backgroundColor: '#e3e3e3',
    margin: 20,
  },
  input:{
    padding: 10,
    borderBottomWidth: 1,
    width: '90%',
    alignSelf: 'center',
    fontSize: 14,
    borderBottomColor: '#93A6EA',
  }
})
