import React, { useState, useContext, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faStar, faAngleDown, faAngleUp, faPlus, faComment } from '@fortawesome/free-solid-svg-icons'
import { faStar as faStarOutline, faComment as faCommentOutline} from '@fortawesome/free-regular-svg-icons'
import axios from 'axios'

import { ModelsContext  } from '../ModelsContext';

import Loading from '../components/Loading';
import LoadingError from '../components/LoadingError';

const CasesPage = ({id}) => {

  const [ models ] = useContext(ModelsContext);
  const [ cases, setCases ] = useState({ loading: true });
  const [ filter, setFilter ] = useState({ starred: false, commented: false });

  useEffect(() => {
    axios.get('http://localhost:8080/api/models/' + id + '/cases')
      .then(response => setCases({ 
        loading: false, 
        data: response.data, 
        byId: byId(response.data) }))
      .catch(err => setCases({ loading: false, error: err }))
  }, [id]);

  const byId = (data) => {
    return data.reduce((obj, item) => {
      obj[item.id] = item
      return obj
    }, {});
  }

  const toggleStarred = (thecase) => {
    setCases(prev => {
      return { ...prev, data: prev.data.map((row) => {
        return row.id === thecase.id ? {...row, starred: !row.starred} : row
      })}
    });
  }

  const toggleDetail = (thecase) => {
    setCases(prev => {
      return { ...prev, data: prev.data.map((row) => {
        return row.id === thecase.id ? {...row, detailed: !row.detailed} : row
      })}
    });
  }

  const NoCases = () => (
    <div>No, there are no cases of this kind.</div>
  )

  const CaseActions = (props) => (
    <div className="pt-2 float-right">
      <FontAwesomeIcon icon={props.thecase.starred ? faStar : faStarOutline} size="lg" 
        className={props.thecase.starred ? 'cursor-pointer text-success' : 'cursor-pointer'}
        onClick={() => toggleStarred(props.thecase)}/>
      <FontAwesomeIcon icon={props.thecase.detailed ? faAngleUp : faAngleDown} size="lg" 
        className="ml-3 cursor-pointer"
        onClick={() => toggleDetail(props.thecase)}/>
    </div>
  )

  const CaseDetail = props => {
    return !props.thecase.detailed ? null : (
      <div className="col-md-12 pt-3 text-secondary">
        Revision<span className="text-black ml-2 mr-2">{props.thecase.revision}</span>
        created by<span className="text-black ml-2">{props.thecase.createdBy}</span>.
      </div>
    )
  }

  const CaseRow = (props) => (
    <div className="p-2 pl-3 mb-1 mr-3 bg-white text-dark">
      <div className="col-md-12">
        <CaseActions thecase={props.thecase} />
        <h5 className="text-primary">{props.thecase.name}</h5>
        <div className="text-secondary">{props.thecase.description ? props.thecase.description : 'No description.'}</div>
      </div>
      <CaseDetail thecase={props.thecase} />
    </div>
  )

  const Cases = (props) => {
    const filtered = props.cases
      .filter(c => filter.starred ? c.starred : true)
      .filter(c => filter.commented ? c.commented : true)
      .map(c => <CaseRow thecase={c} key={c.id} />);
    return filtered.length > 0 ? filtered : <NoCases />
  }

  return (
    <div>
      <h4 className="text-muted font-weight-light text-uppercase mb-4 mr-3">
        <FontAwesomeIcon icon={faPlus} className="mr-2 float-right cursor-pointer text-success"
          onClick={() => console.log("Add")}/>
        { models.data && models.byId[id] ? models.byId[id].name + 's' : '' }
      </h4>
      {
        models.loading || cases.loading ? <Loading /> : 
        models.error || cases.error ? <LoadingError error = { models.error }/> :  
        models.byId[id] && cases.data ? <Cases cases={cases.data}/> : 
        <NoCases />
      }
    </div>  
  )
};

export default CasesPage;



