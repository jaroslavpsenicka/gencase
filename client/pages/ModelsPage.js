import React, { useState, useEffect } from 'react';
import axios from 'axios'
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faComment as faCommentOutline} from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ModelsPage = () => {

  const [ models, setModels ] = useState();
  const [ filter, setFilter ] = useState({});
  const [ loadingError, setLoadingError ] = useState({});

  useEffect(() => {
    axios.get('http://localhost:8080/api/models')
      .then(response => setModels(response.data))
      .catch(err => setLoadingError(err))
  }, []);

  const toggleStarred = (model) => {
    axios.put('http://localhost:8080/api/models/' + model.id, { starred: !model.starred })
      .then(resp => setModels(prev => prev.map(row => {
        return row.id === model.id ? {...row, starred: !row.starred} : row })))
      .catch(err => console.log('cannot toggle', model, err));
  }

  const toggleDetail = (model) => {
    setModels(prev => prev.map((row) => {
      return row.id === model.id ? {...row, detailed: !row.detailed} : row
    }));
  }

  const toggleCommentFilter = ()  => {
    setFilter({ ...filter, commented: !filter.commented });
  }

  const toggleStarredFilter = ()  => {
    setFilter({ ...filter, starred: !filter.starred });
  }

  const uploadModel = () => {
  }

  const Loading = () => (
    <div>Loading...</div>
  )

  const LoadingError = () => (
    <div>Oops, something went wrong.</div>
  )

  const Models = () => {
    const filtered = models
      .filter(m => filter.starred ? m.starred : true)
      .filter(m => filter.commented ? m.commented : true)
      .map(m => <ModelRow model={m} key={m.id} />);
    return filtered.length > 0 ? filtered : <NoModels />
  }

  const NoModels = () => (
    <div className="mt-5 text-center text-secondary">No, there is no such model.</div>
  );

  const ModelActions = props => (
    <div className="pt-2 float-right">
      <FontAwesomeIcon icon={props.model.starred ? faStar : faStarOutline} size="lg" 
        className={props.model.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
        onClick={() => toggleStarred(props.model)}/>
      <FontAwesomeIcon icon={props.model.detailed ? faAngleUp : faAngleDown} size="lg" 
        className="ml-3 cursor-pointer"
        onClick={() => toggleDetail(props.model)}/>
    </div>
  )

  const ModelDetail = props => {
    return !props.model.detailed ? null : (
      <div className="col-md-12 pt-3 text-secondary">
        Revision<span className="text-black ml-2 mr-2">{props.model.revision}</span>
        created by<span className="text-black ml-2">{props.model.author}</span>.
      </div>
    )
  }

  const ModelRow = props => (
    <div className="p-2 pl-3 mb-2 mr-3 bg-white text-dark">
      <div className="col-md-12">
        <ModelActions model={props.model} />
        <h5 className="text-primary">{props.model.name}</h5>
        <div className="text-secondary">{props.model.description}</div>
      </div>
      <ModelDetail model={props.model} />
    </div>
  )

  return (  
    <div>
      <h4 className="text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => uploadModel()}/>
        <FontAwesomeIcon icon={filter.commented ? faComment : faCommentOutline} 
          className="mr-4 float-right"
          onClick={() => toggleCommentFilter()} />
        <FontAwesomeIcon icon={filter.starred ? faStar : faStarOutline} 
          className="mr-4 float-right"
          onClick={() => toggleStarredFilter()} />
        Models
      </h4>
      { models ? <Models /> : loadingError ? <LoadingError /> : <Loading /> }
    </div>
  )
};

export default ModelsPage;
