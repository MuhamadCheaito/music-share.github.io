import { useMutation, useSubscription } from '@apollo/react-hooks'
import { Favorite, FavoriteBorder, FavoriteOutlined, Pause, PlayArrow, Save } from '@mui/icons-material'
import { Card, CardActions, CardContent, 
        CardMedia, CircularProgress, IconButton, Typography } from '@mui/material'
import { makeStyles } from '@mui/styles'
import React, { useContext, useEffect, useState } from 'react'
import { SongContext } from '../App'
import { ADD_OR_REMOVE_FROM_QUEUE } from '../graphql/mutations'
import { GET_SONGS } from '../graphql/subscriptions'

const useStyles = makeStyles(theme => ({
  container:{
    margin: theme.spacing(3)
  },
  songInfoContainer: {
    display: 'flex',
    alignItems: 'center'
  },
  songInfo: {
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between'
  },
  thumbnail:{
    objectFit: 'cover',
    width: 140,
    height: 140
  },
}))


const SongList = () => {
  const {data, loading, error} = useSubscription(GET_SONGS)

  if(loading){
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 50
      }}>
        <CircularProgress />
      </div>
    )
  }
  if(error) return <div>Error fetching songs</div>
  return (
    <div>{data.song.map((song, i) => (
      <Song key={song.id} song={song}/> 
    ))}</div>
  )
}

function Song({song}) {
  const {id,title,artist,thumbnail} = song
  const classes = useStyles()
  const [addOrRemoveFromQueue] = useMutation(ADD_OR_REMOVE_FROM_QUEUE,{
    onCompleted: data => {
      localStorage.setItem('queue',JSON.stringify(data.addOrRemoveFromQueue))
    }
  })
  const [currentSongPlaying, setCurrentSongPlaying] = useState(false)
  const {state, dispatch} = useContext(SongContext)
  useEffect(() => {
    const isSongPlaying = state.isPlaying && id === state.song.id
    setCurrentSongPlaying(isSongPlaying)
  },[id, state.song.id,state.isPlaying])

  function handleTogglePlay(){
    dispatch({type: "SET_SONG", payload: {song}})
    dispatch(state.isPlaying ? {type: "PAUSE_SONG"} : {type:"PLAY_SONG"})
  }
  function handleAddOrRemoveFromQueue(){
    addOrRemoveFromQueue({
      variables: {input:{
        ...song,
        __typename: 'Song'
      }}
    })
  }
  return <Card className={classes.container}>
    <div className={classes.songInfoContainer}>
      <CardMedia image={thumbnail} className={classes.thumbnail}/>
      <div className={classes.songInfo}>
        <CardContent>
          <Typography gutterBottom variant="h5" component="h2">
            {title}
          </Typography>
          <Typography  variant="body1" component="p" color="textSecondary">
            {artist}
          </Typography>
        </CardContent>
        <CardActions>
            <IconButton onClick={handleTogglePlay} size="small" color="primary">
              {currentSongPlaying ? <Pause /> : <PlayArrow/>}
            </IconButton>
            <IconButton onClick={handleAddOrRemoveFromQueue} size="small">
              <Favorite color="error"/> 
            </IconButton>
        </CardActions>
      </div>
    </div>
  </Card>
}
export default SongList