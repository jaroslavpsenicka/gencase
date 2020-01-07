This is a simple data case management (DC) system. It's main purpose is to keep case data valid as well as

- define a case with relevant state model (state chart),
- integrate with existing BPM process system on state transitions (edges),
- define one or more case phases, each phase may have specific data model,
- deal with data passed to and returned from BPM processes. 

## Simple loan scenario

Upload model and create case
- upload a simple loan case model from IDEA,
- show the model definition in DC UI, with statechart, phases and data model, 
- create case from command-line (curl),
- show the case in state "identification" (auto-run from "new"),
- issue the funds check
- show event history
 
Do the tasks
- switch to BPM and take both tasks, resolve them
- switch back to case detail, see task completion notification 
- show callbacks and data mapping in event history
- show case moved to approval phase (incl. data migration, new fields)
- show new task created (basic approval)

Model upgrade
- split name attribute in two, deploy the model
- observe the data migration dialog, configure migration, process
- show case detail with new fields 

### Model upgrade

Migrating one field (clientName) into two (clientFirstName, clientLastName) using simple rules (clientFirstName = clientName.split(' )[0], clientLastName = clientName.split(' )[1]). Approval task requires both clientId and clientName fields to be present, mapping need to be updated within the model (concat, as part of new case spec).

